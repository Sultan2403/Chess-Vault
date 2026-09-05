import type {
  Folder,
  CreateFolderInput,
  UpdateFolderInput,
  ListFoldersQuery,
} from "@chess-vault/shared";
import api from "./api.client";

export type ListFoldersParams = ListFoldersQuery;

export type CreateFolderPayload = Omit<CreateFolderInput, "userId">;

export type UpdateFolderPayload = UpdateFolderInput;

export interface ListFoldersResponse {
  success: boolean;
  folders: Folder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FolderResponse {
  success: boolean;
  folder: Folder;
}

export interface DeleteFolderResponse {
  success: boolean;
}

const foldersApi = {
  getFolders: (params?: ListFoldersParams): Promise<ListFoldersResponse> =>
    api.get("/api/folders", { params }),

  getFolder: (id: string): Promise<FolderResponse> =>
    api.get(`/api/folders/${id}`),

  createFolder: (data: CreateFolderPayload): Promise<FolderResponse> =>
    api.post("/api/folders", data),

  updateFolder: (
    id: string,
    data: UpdateFolderPayload,
  ): Promise<FolderResponse> => api.patch(`/api/folders/${id}`, data),

  deleteFolder: (id: string): Promise<DeleteFolderResponse> =>
    api.delete(`/api/folders/${id}`),
};

export default foldersApi;
