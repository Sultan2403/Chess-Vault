import { z } from "zod";
import { toNumberOrUndefined } from "../utils/index.js";
import { PlayerColors } from "../constants/index.js";

export const createFolderBody = z.object({
  name: z.string().trim().min(1, "Folder name is required"),
  description: z.string().trim().optional(),
});

export const updateFolderBody = z.object({
  name: z.string().trim().min(1, "Folder name cannot be empty").optional(),
  description: z.string().trim().optional(),
});

export const folderParams = z.object({
  id: z.string().trim().min(1, "Folder ID is required"),
});

export const listFoldersQuery = z.object({
  page: z.preprocess(toNumberOrUndefined, z.number().int().positive().optional()),
  limit: z.preprocess(toNumberOrUndefined, z.number().int().positive().optional()),
});

export const listFolderGamesQuery = z.object({
  page: z.preprocess(toNumberOrUndefined, z.number().int().positive().default(1)).optional(),
  limit: z.preprocess(toNumberOrUndefined, z.number().int().min(1).max(100).default(12)).optional(),
  search: z.string().trim().max(100).optional(),
  userPlayedAs: z.enum(PlayerColors).optional(),
});
