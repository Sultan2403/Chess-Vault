import { z } from "zod";
import {
  createFolderBody,
  updateFolderBody,
  folderParams,
  listFoldersQuery,
} from "../schemas/folder.schema.js";
import type { Game } from "./games.types.js";

export type CreateFolderInput = z.infer<typeof createFolderBody> & {
  userId: string;
};

export type UpdateFolderInput = z.infer<typeof updateFolderBody>;

export type FolderParams = z.infer<typeof folderParams>;
export type ListFoldersQuery = z.infer<typeof listFoldersQuery>;

export type Folder = {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type FolderCoverGame = {
  id: string;
  finalFen?: string;
  playedAt: Date | string;
  whitePlayer: { username: string; rating: number };
  blackPlayer: { username: string; rating: number };
};

export type FolderItem = Folder & {
  gameCount: number;
  coverGame?: FolderCoverGame;
};

export type PaginatedFolders = {
  folders: FolderItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CollectionDiscoveryCategory =
  | "biggest_win"
  | "marathon_battle"
  | "personal_note"
  | "frequent_opponent"
  | "quick_miniature";

export type CollectionDiscovery = {
  id: string;
  category: CollectionDiscoveryCategory;
  label: string;
  badgeText: string;
  storyQuote: string;
  game: Game;
  isPrimary: boolean;
};

export type CollectionSummary = {
  folder: Folder;
  gameCount: number;
  coverGame?: FolderCoverGame;
  discoveries: CollectionDiscovery[];
};

