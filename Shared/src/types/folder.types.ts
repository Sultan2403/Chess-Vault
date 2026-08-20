import { z } from "zod";
import {
  createFolderBody,
  updateFolderBody,
  folderParams,
  listFoldersQuery,
} from "../schemas/folder.schema.js";

export type CreateFolderInput = z.infer<typeof createFolderBody> & {
  userId: string;
};

export type UpdateFolderInput = z.infer<typeof updateFolderBody>;

export type FolderParams = z.infer<typeof folderParams>;
export type ListFoldersQuery = z.infer<typeof listFoldersQuery>;

export type Folder = {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type PaginatedFolders = {
  folders: Array<Record<string, unknown>>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
