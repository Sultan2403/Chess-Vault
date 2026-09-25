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

import { parseGame } from "@mliebelt/pgn-parser";
import { GameMovesCount } from "../types/games.types.js";

/**
 * Calculates plies (half-moves) and full moves from a PGN string using @mliebelt/pgn-parser.
 */
export function getPgnMoveCount(pgn?: string | null): GameMovesCount {
  if (!pgn?.trim()) {
    return { plies: 0, count: 0 };
  }

  try {
    const { moves } = parseGame(pgn);
    const plies = moves.length;
    const count = Math.ceil(plies / 2);

    return { plies, count };
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
