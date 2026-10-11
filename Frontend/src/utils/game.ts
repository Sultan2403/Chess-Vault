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
 * Calculates net captured pieces and material advantage for both players directly from the current FEN board position.
 * Only the side with a net surplus of a piece type displays that piece symbol, exactly matching Chess.com and Lichess.
 */
export function getCapturedPieces(fen?: string): CapturedPiecesSummary {
  if (!fen) {
    return {
      white: { pieces: [], advantage: 0 },
      black: { pieces: [], advantage: 0 },
    };
  }

  // Count piece types currently on the board from the piece placement part of FEN
  const boardPart = fen.split(" ")[0];
  const currentWhiteCounts: Record<CapturedPieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const currentBlackCounts: Record<CapturedPieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };

  for (const char of boardPart) {
    if ("PNBRQ".includes(char)) {
      currentWhiteCounts[char.toLowerCase() as CapturedPieceSymbol]++;
    } else if ("pnbrq".includes(char)) {
      currentBlackCounts[char as CapturedPieceSymbol]++;
    }
  }

  // Standard piece values
  let whitePoints = 0;
  let blackPoints = 0;
  for (const [piece, val] of Object.entries(PIECE_VALUES) as [CapturedPieceSymbol, number][]) {
    whitePoints += currentWhiteCounts[piece] * val;
    blackPoints += currentBlackCounts[piece] * val;
  }

  const whiteSurplusPieces: CapturedPieceSymbol[] = [];
  const blackSurplusPieces: CapturedPieceSymbol[] = [];

  // Compare counts for each piece type: who has more on the board?
  // If White has more, White captured Black's piece (White is up that piece).
  // If Black has more, Black captured White's piece (Black is up that piece).
  const pieces: CapturedPieceSymbol[] = ["q", "r", "b", "n", "p"];
  for (const piece of pieces) {
    const diff = currentWhiteCounts[piece] - currentBlackCounts[piece];
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        whiteSurplusPieces.push(piece);
      }
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        blackSurplusPieces.push(piece);
      }
    }
  }

  const sortFn = (a: CapturedPieceSymbol, b: CapturedPieceSymbol) =>
    PIECE_SORT_ORDER[a] - PIECE_SORT_ORDER[b];

  whiteSurplusPieces.sort(sortFn);
  blackSurplusPieces.sort(sortFn);

  const totalDiff = whitePoints - blackPoints;

  return {
    white: {
      pieces: whiteSurplusPieces,
      advantage: totalDiff > 0 ? totalDiff : 0,
    },
    black: {
      pieces: blackSurplusPieces,
      advantage: totalDiff < 0 ? Math.abs(totalDiff) : 0,
    },
  };
}
