import z from "zod";
import { GameSchema } from "../Schemas/games.schema";
import { PlatformType } from "../Config/constants";

export type Game = z.infer<typeof GameSchema>;

export interface ImportGameParams {
  userId: string;
  folderId: string;
  username: string;
}

export interface ImportGamesParams extends ImportGameParams {
  platform: PlatformType;
}

interface Chess_Com_Player {
  rating: number;
  result: string;
  "@id": string;
  username: string;
  uuid: string;
}

export type Chess_Com_Game = {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  tcn: string;
  uuid: string;
  initial_setup: string;
  fen: string;
  time_class: string;
  rules: string;
  white: Chess_Com_Player;
  black: Chess_Com_Player;
  eco?: string;
};

export interface Lichess_Game {
  id: string;
  rated: boolean;

  variant: string;
  speed: string;
  perf: string;

  createdAt: number;
  lastMoveAt: number;

  status: string;
  source: string;

  winner?: "white" | "black";

  players: {
    white: {
      user: {
        id: string;
        name: string;
      };
      rating: number;
      ratingDiff: number;
    };

    black: {
      user: {
        id: string;
        name: string;
      };
      rating: number;
      ratingDiff: number;
    };
  };

  moves: string;
  pgn: string;

  clock: {
    initial: number;
    increment: number;
    totalTime: number;
  };
}
