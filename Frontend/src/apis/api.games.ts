import type {
  Game,
  ImportResult,
  ImportGamesParams,
  GameSearchParams,
  UpdateGameInput,
} from "@chess-vault/shared";
import api from "./api.client";

export type FrontendImportGamesPayload = Omit<ImportGamesParams, "userId">;

export type SearchGamesParams = Partial<Omit<GameSearchParams, "userId">>;

export type UpdateGamePayload = UpdateGameInput;

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

export interface DeleteGameResponse {
  success: boolean;
  message?: string;
}

const gamesApi = {
  getGames: (params?: SearchGamesParams): Promise<SearchGamesResponse> =>
    api.get("/games", { params }),

  getGame: (id: string): Promise<GameResponse> => api.get(`/games/${id}`),

  updateGame: (id: string, data: UpdateGamePayload): Promise<GameResponse> =>
    api.patch(`/games/${id}`, data),

  deleteGame: (id: string): Promise<DeleteGameResponse> =>
    api.delete(`/games/${id}`),

  importGames: (data: FrontendImportGamesPayload): Promise<ImportResult> =>
    api.post("/games/import", data),
};

export default gamesApi;

