import type {
  Game,
  ImportResult,
  ImportGamesParams,
  GameSearchParams,
} from "@chess-vault/shared";
import api from "./api.client";

export type ImportGamesPayload = Omit<ImportGamesParams, "userId">;

export type SearchGamesParams = Omit<GameSearchParams, "userId">;

export interface SearchGamesResponse {
  success: boolean;
  message: string;
  games: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GameResponse {
  success: boolean;
  game: Game;
}

const gamesApi = {
  getGames: (params?: SearchGamesParams): Promise<SearchGamesResponse> =>
    api.get("/api/games", { params }),

  getGame: (id: string): Promise<GameResponse> =>
    api.get(`/api/games/${id}`),

  importGames: (data: ImportGamesPayload): Promise<ImportResult> =>
    api.post("/api/games/import", data),
};

export default gamesApi;

