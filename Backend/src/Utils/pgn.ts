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
