import { format } from "date-fns";
import type { Game, PlayerType, PlayerColorType } from "@chess-vault/shared";

export type PlayerPerspective = {
  player: PlayerType;
  opponent: PlayerType;
  playerColor: PlayerColorType;
  opponentColor: PlayerColorType;
  result: "win" | "loss" | "draw";
};

/**
 * Gets the player's perspective in the game.
 * Uses the persisted `userPlayedAs` property on the game record.
 * 
 * @param game - The game played 
 */
export function getPlayerPerspective(
  game: Game
): PlayerPerspective {
  const playerColor = game.userPlayedAs;
  const opponentColor: PlayerColorType = playerColor === "white" ? "black" : "white";

  const player = playerColor === "white" ? game.whitePlayer : game.blackPlayer;
  const opponent = playerColor === "white" ? game.blackPlayer : game.whitePlayer;

  const result =
    game.result === "draw"
      ? "draw"
      : game.result === playerColor
        ? "win"
        : "loss";

  return { player, opponent, playerColor, opponentColor, result };
}

export function getGameDate(game: Game, pattern = "MMM dd, yyyy") {
  if (!game.playedAt) return "Unknown date";
  const dateObj =
    typeof game.playedAt === "string" ? new Date(game.playedAt) : game.playedAt;
  if (isNaN(dateObj.getTime())) return "Unknown date";
  return format(dateObj, pattern);
}

export { getMoveCount, getPgnMoveCount } from "@chess-vault/shared";

/**
 * Returns the opening details stored on the game record.
 * eco, opening name, and variation are parsed at import time
 * from platform data and stored as first-class fields on Game.
 */
export function parseOpeningDetails(game: Game): {
  eco?: string;
  opening?: string;
  variation?: string;
} {
  return {
    eco:       game.opening?.eco,
    opening:   game.opening?.name,
    variation: game.opening?.variation,
  };
}

/**
 * Formats remaining clock milliseconds into MM:SS (or H:MM:SS for games over 1 hour).
 * Returns "—" if ms is undefined or null.
 *
 * @example
 * formatClockMs(93_000)  // "1:33"
 * formatClockMs(3_661_000) // "1:01:01"
 * formatClockMs(undefined) // "—"
 */
export function formatClockMs(ms: number | undefined): string {
  if (ms === undefined || ms === null) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Capitalizes a timeClass value for human-readable display.
 * Converts hyphenated kebab-case to title case.
 *
 * @example
 * formatTimeClass("ultra-bullet") // "Ultra Bullet"
 * formatTimeClass("blitz")        // "Blitz"
 * formatTimeClass("rapid")        // "Rapid"
 */
export function formatTimeClass(timeClass: Game["time"]["timeClass"]): string {
  return timeClass
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Formats a GameTime object into a human-readable time control string.
 * initial and increment are in milliseconds; daysPerTurn is in days.
 *
 * @example
 * formatTimeControl({ timeClass: "blitz", initial: 180_000, increment: 2_000 })
 *   // "Blitz • 3 min + 2s"
 * formatTimeControl({ timeClass: "rapid", initial: 600_000, increment: 0 })
 *   // "Rapid • 10 min"
 * formatTimeControl({ timeClass: "daily", daysPerTurn: 3 })
 *   // "Daily • 3 days/move"
 * formatTimeControl({ timeClass: "correspondence" })
 *   // "Correspondence"
 */
export function formatTimeControl(time: Game["time"]): string {
  const label = formatTimeClass(time.timeClass);

  if (time.initial !== undefined) {
    const initialSec = Math.round(time.initial / 1000);
    const initialStr =
      initialSec >= 60
        ? `${Math.floor(initialSec / 60)} min`
        : `${initialSec}s`;

    if (time.increment !== undefined && time.increment > 0) {
      const incSec = Math.round(time.increment / 1000);
      return `${label} • ${initialStr} + ${incSec}s`;
    }
    return `${label} • ${initialStr}`;
  }

  if (time.daysPerTurn !== undefined) {
    return `${label} • ${time.daysPerTurn} day${time.daysPerTurn !== 1 ? "s" : ""}/move`;
  }

  return label;
}

export type CapturedPieceSymbol = "p" | "n" | "b" | "r" | "q";

export type PlayerCapturedMaterial = {
  /** Pieces captured by this player */
  pieces: CapturedPieceSymbol[];
  /** Point advantage over the opponent if ahead, otherwise 0 */
  advantage: number;
};

export type CapturedPiecesSummary = {
  white: PlayerCapturedMaterial;
  black: PlayerCapturedMaterial;
};

const PIECE_VALUES: Record<CapturedPieceSymbol, number> = {
  q: 9,
  r: 5,
  b: 3,
  n: 3,
  p: 1,
};

const PIECE_SORT_ORDER: Record<CapturedPieceSymbol, number> = {
  q: 0,
  r: 1,
  b: 2,
  n: 3,
  p: 4,
};

/**
 * Calculates captured pieces and material advantage for both players up to currentPlyIdx.
 * currentPlyIdx is 0-indexed half-move count (e.g. -1 or 0 for start position).
 */
export function getCapturedPieces(
  moveHistory: Array<{ color: "w" | "b"; captured?: string }>,
  currentPlyIdx: number,
): CapturedPiecesSummary {
  const whitePieces: CapturedPieceSymbol[] = [];
  const blackPieces: CapturedPieceSymbol[] = [];
  let whitePoints = 0;
  let blackPoints = 0;

  const maxMoves = Math.min(moveHistory.length, Math.max(0, currentPlyIdx + 1));

  for (let i = 0; i < maxMoves; i++) {
    const move = moveHistory[i];
    if (!move?.captured) continue;

    const piece = move.captured.toLowerCase() as CapturedPieceSymbol;
    if (!(piece in PIECE_VALUES)) continue;

    const value = PIECE_VALUES[piece];

    if (move.color === "w") {
      // White made the move -> White captured a Black piece
      whitePieces.push(piece);
      whitePoints += value;
    } else {
      // Black made the move -> Black captured a White piece
      blackPieces.push(piece);
      blackPoints += value;
    }
  }

  const sortFn = (a: CapturedPieceSymbol, b: CapturedPieceSymbol) =>
    PIECE_SORT_ORDER[a] - PIECE_SORT_ORDER[b];

  whitePieces.sort(sortFn);
  blackPieces.sort(sortFn);

  const diff = whitePoints - blackPoints;

  return {
    white: {
      pieces: whitePieces,
      advantage: diff > 0 ? diff : 0,
    },
    black: {
      pieces: blackPieces,
      advantage: diff < 0 ? Math.abs(diff) : 0,
    },
  };
}
