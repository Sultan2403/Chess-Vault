import type {
  Folder,
  FolderItem,
  CollectionSummary,
  CreateFolderInput,
  UpdateFolderInput,
  ListFoldersQuery,
  ListFolderGamesQuery,
  PaginatedFolderGames,
} from "@chess-vault/shared";
import api from "./api.client";

export type ListFoldersParams = ListFoldersQuery;
export type ListFolderGamesParams = ListFolderGamesQuery;

export type CreateFolderPayload = Omit<CreateFolderInput, "userId">;

export type UpdateFolderPayload = UpdateFolderInput;

export interface ListFoldersResponse {
  success: boolean;
  folders: FolderItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FolderGamesResponse extends PaginatedFolderGames {
  success: boolean;
}

export interface FolderResponse {
  success: boolean;
  folder: Folder;
}

export interface FolderSummaryResponse {
  success: boolean;
  summary: CollectionSummary;
}

export interface DeleteFolderResponse {
  success: boolean;
}

const foldersApi = {
  getFolders: (params?: ListFoldersParams): Promise<ListFoldersResponse> =>
    api.get("/folders", { params }),

  getFolder: (id: string): Promise<FolderResponse> =>
    api.get(`/folders/${id}`),

  getFolderSummary: (id: string): Promise<FolderSummaryResponse> =>
    api.get(`/folders/${id}/summary`),

  getFolderGames: (
    id: string,
    params?: ListFolderGamesParams,
  ): Promise<FolderGamesResponse> => api.get(`/folders/${id}/games`, { params }),

  createFolder: (data: CreateFolderPayload): Promise<FolderResponse> =>
    api.post("/folders", data),

  updateFolder: (
    id: string,
    data: UpdateFolderPayload,
  ): Promise<FolderResponse> => api.patch(`/folders/${id}`, data),

  deleteFolder: (id: string): Promise<DeleteFolderResponse> =>
    api.delete(`/folders/${id}`),
};

export default foldersApi;
