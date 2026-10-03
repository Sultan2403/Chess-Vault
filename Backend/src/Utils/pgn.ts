import type { Lichess_Game } from "@chess-vault/shared";

/**
 * Extracts the value of a named PGN header tag from a raw PGN string.
 *
 * @example
 * parsePgnHeader(pgn, "ECO")     // -> "B07"
 * parsePgnHeader(pgn, "Opening") // -> "Pirc Defense"
 */
export function parsePgnHeader(
  pgn: string,
  header: string,
): string | undefined {
  const match = pgn.match(new RegExp(`\\[${header}\\s+"([^"]+)"\\]`));
  return match ? match[1] : undefined;
}

/**
 * Derives opening details from a Lichess game's structured opening object.
 *
 * Lichess returns a single `name` string that combines the opening family and
 * variation separated by ": " (e.g. "King's Gambit Accepted: Fischer Defense").
 * This function splits that into `name` and `variation`, discarding `ply`.
 *
 * Returns `undefined` when no opening object is present (e.g. very short games).
 */
export function parseLichessOpening(
  opening: Lichess_Game["opening"],
): { eco?: string; name?: string; variation?: string } | undefined {
  if (!opening) return undefined;

  const colonIdx = opening.name.indexOf(": ");
  const name =
    colonIdx >= 0 ? opening.name.substring(0, colonIdx) : opening.name;
  const variation =
    colonIdx >= 0 ? opening.name.substring(colonIdx + 2) : undefined;

  return {
    eco: opening.eco,
    name,
    variation,
  };
}

/**
 * Derives opening details from a Chess.com PGN string by reading standard
 * PGN header tags: [ECO "..."], [Opening "..."], [Variation "..."].
 *
 * Returns `undefined` when none of the relevant headers are present.
 */
export function parseChessComOpening(
  pgn: string,
): { eco?: string; name?: string; variation?: string } | undefined {
  const eco = parsePgnHeader(pgn, "ECO");
  const name = parsePgnHeader(pgn, "Opening");
  const variation = parsePgnHeader(pgn, "Variation");

  if (!eco && !name && !variation) return undefined;

  return { eco, name, variation };
}

/**
 * Parses a clock string in H:MM:SS or MM:SS format (with optional fractional seconds)
 * into an integer number of milliseconds.
 *
 * @example
 * parseClockStringToMs("0:00:28.8") // -> 28800
 * parseClockStringToMs("0:05:00")   // -> 300000
 * parseClockStringToMs("1:15:30")   // -> 4530000
 * parseClockStringToMs("0:00:00")   // -> 0
 */
export function parseClockStringToMs(clockStr: string): number | undefined {
  if (!clockStr || typeof clockStr !== "string") return undefined;

  const parts = clockStr.trim().split(":");
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    seconds = parseFloat(parts[2]);
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10);
    seconds = parseFloat(parts[1]);
  } else {
    return undefined;
  }

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds) ||
    hours < 0 ||
    minutes < 0 ||
    seconds < 0
  ) {
    return undefined;
  }

  const ms = Math.round(hours * 3600000 + minutes * 60000 + seconds * 1000);
  return Number.isFinite(ms) && ms >= 0 ? ms : undefined;
}

/**
 * Strips parenthesized variations from PGN move text, retaining only the mainline.
 */
function stripVariations(text: string): string {
  let result = "";
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "(") {
      depth++;
    } else if (char === ")") {
      if (depth > 0) depth--;
    } else if (depth === 0) {
      result += char;
    }
  }
  return result;
}

/**
 * Extracts and parses every [%clk ...] annotation from the mainline PGN.
 * Returns an array of remaining clock times in integer milliseconds in ply order.
 * Returns `undefined` if no clock annotations are found.
 */
export function parsePgnClocks(pgn?: string | null): number[] | undefined {
  if (!pgn || !pgn.trim()) return undefined;

  // Isolate moves section (after headers)
  const sep = pgn.search(/\n\r?\n/);
  const movesSection = sep >= 0 ? pgn.slice(sep) : pgn;

  // Strip out non-mainline variations
  const mainline = stripVariations(movesSection);

  const regex = /\[%clk\s+([0-9]+(?::[0-9]+)+(?:\.[0-9]+)?)\]/gi;
  const clocks: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(mainline)) !== null) {
    const ms = parseClockStringToMs(match[1]);
    if (ms !== undefined) {
      clocks.push(ms);
    }
  }

  return clocks.length > 0 ? clocks : undefined;
}

/**
 * Normalizes a Lichess structured `clocks` array (where values are in centiseconds)
 * into integer milliseconds.
 *
 * Returns `undefined` if clocks data is empty, absent, or malformed, triggering
 * fallback to PGN clock parsing.
 */
export function normalizeLichessClocks(
  clocks?: number[] | null,
): number[] | undefined {
  if (!Array.isArray(clocks) || clocks.length === 0) {
    return undefined;
  }

  const normalized: number[] = [];
  for (const cs of clocks) {
    if (typeof cs !== "number" || isNaN(cs) || cs < 0) {
      return undefined;
    }
    normalized.push(Math.round(cs * 10));
  }

  return normalized.length > 0 ? normalized : undefined;
}

/**
 * Parses a Chess.com time_control string into structured time parameters:
 * - Live with increment (e.g. "180+2") -> initial: 180000 ms, increment: 2000 ms
 * - Live without increment (e.g. "180", "600") -> initial: 180000/600000 ms, increment: 0 ms
 * - Daily/correspondence (e.g. "1/259200") -> daysPerTurn: 3 (259200 / 86400)
 *
 * Returns an object with available fields (initial, increment, daysPerTurn).
 */
export function parseChessComTimeControl(timeControl?: string | null): {
  initial?: number;
  increment?: number;
  daysPerTurn?: number;
} {
  if (!timeControl || typeof timeControl !== "string") {
    return {};
  }

  const trimmed = timeControl.trim();

  // Daily format: "1/<seconds-per-turn>"
  const dailyMatch = /^1\/(\d+)$/.exec(trimmed);
  if (dailyMatch) {
    const seconds = parseInt(dailyMatch[1], 10);
    if (!isNaN(seconds) && seconds > 0) {
      return {
        daysPerTurn: seconds / 86400,
      };
    }
  }

  // Live format with increment: "<initial-seconds>+<increment-seconds>"
  const incMatch = /^(\d+)\+(\d+)$/.exec(trimmed);
  if (incMatch) {
    const initialSec = parseInt(incMatch[1], 10);
    const incSec = parseInt(incMatch[2], 10);
    if (!isNaN(initialSec) && !isNaN(incSec) && initialSec >= 0 && incSec >= 0) {
      return {
        initial: initialSec * 1000,
        increment: incSec * 1000,
      };
    }
  }

  // Live format without increment: "<initial-seconds>"
  const baseMatch = /^(\d+)$/.exec(trimmed);
  if (baseMatch) {
    const initialSec = parseInt(baseMatch[1], 10);
    if (!isNaN(initialSec) && initialSec >= 0) {
      return {
        initial: initialSec * 1000,
        increment: 0,
      };
    }
  }

  return {};
}

