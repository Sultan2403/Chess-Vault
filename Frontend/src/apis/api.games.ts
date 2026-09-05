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

const gamesApi = {
  getGames: (params?: SearchGamesParams): Promise<SearchGamesResponse> =>
    api.get("/api/games", { params }),

  importGames: (data: ImportGamesPayload): Promise<ImportResult> =>
    api.post("/api/games/import", data),
};

export default gamesApi;
