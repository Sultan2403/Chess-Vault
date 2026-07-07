import z from "zod";
import { GameSchema } from "../Schemas/games.schema";

export type Game = z.infer<typeof GameSchema>;

export interface Chess_Com_Player {
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
