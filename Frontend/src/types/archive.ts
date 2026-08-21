import type { LinkedAccount } from "@chess-vault/shared";

export type GameResult = "win" | "loss" | "draw";
export type ArchiveGame = {
  id: string;
  createdAt: string;
  opening: string;
  variation: string;
  opponent: string;
  playerRating: number;
  opponentRating: number;
  result: GameResult;
  timeClass: "Classical" | "Rapid" | "Blitz";
  moveCount: number;
  source: "Chess.com" | "Lichess";
};

export type PlatformConnection = Pick<LinkedAccount, "id" | "platform" | "username" | "lastSyncedAt"> & { connected: boolean };
export type Collection = { title: string; entries: number; description: string; variant: "feature" | "compact" | "dark" };
