export const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const isValidMongoId = (value: unknown): value is string => {
  return typeof value === "string" && MONGO_ID_REGEX.test(value);
};

export const toNumberOrUndefined = (val: unknown) => {
  if (val === undefined || val === null) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
};

export const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

import { GameMovesCount } from "../types/games.types.js";

/**
 * Calculates plies (half-moves) and full moves from a PGN string.
 *
 * Avoids a full PGN parse (which is synchronous and expensive at import scale).
 * Instead, isolates the moves section and strips all non-move tokens, leaving
 * one whitespace-separated token per ply.
 *
 * Handles: comments `{...}`, move numbers `1.` / `3...`, result tokens,
 * NAG annotations `$6`, and move quality symbols `!?`.
 *
 * Accurate for standard game PGNs from Chess.com and Lichess.
 */
export function getPgnMoveCount(pgn?: string | null): GameMovesCount {
  if (!pgn?.trim()) {
    return { plies: 0, count: 0 };
  }

  try {
    // Isolate the moves section — everything after the header block.
    // PGN headers are separated from moves by a blank line (\n\n or \r\n\r\n).
    const sep = pgn.search(/\n\r?\n/);
    const movesSection = sep >= 0 ? pgn.slice(sep) : pgn;

    const plies = movesSection
      .replace(/\{[^}]*\}/g, " ") // strip { comments }
      .replace(/\([^)]*\)/g, " ") // strip (variations) — non-nested
      .replace(/\d+\.+/g, " ") // strip move numbers: 1. or 3...
      .replace(/\$\d+/g, " ") // strip NAG annotations: $6
      .replace(/[!?]+/g, " ") // strip move quality symbols: !, ?, !?
      .replace(/1-0|0-1|1\/2-1\/2|\*/g, "") // strip result token
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return { plies, count: Math.ceil(plies / 2) };
  } catch {
    return { plies: 0, count: 0 };
  }
}

/**
 * Returns the total number of full moves for a game or PGN string.
 * Leverages the game's cached `moves.count` if present, or parses via `getPgnMoveCount`.
 */
export function getMoveCount(
  input?: string | { pgn?: string | null; moves?: GameMovesCount } | null,
): number {
  if (!input) return 0;
  if (typeof input !== "string" && input.moves?.count !== undefined) {
    return input.moves.count;
  }
  const pgn = typeof input === "string" ? input : input.pgn;
  return getPgnMoveCount(pgn).count;
}
