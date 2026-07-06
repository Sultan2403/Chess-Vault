import { z } from "zod";
import { toNumberOrUndefined } from "../Utils";

export const createFolderBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateFolderBody = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const folderParams = z.object({
  id: z.string().min(1),
});

export const listFoldersQuery = z.object({
  page: z.preprocess(toNumberOrUndefined, z.number().int().positive().optional()),
  limit: z.preprocess(toNumberOrUndefined, z.number().int().positive().optional()),
});

// Routers should assemble and pass validation objects explicitly, for example:
// validate({ body: createFolderBody })
// validate({ params: folderParams, body: updateFolderBody })
// validate({ query: listFoldersQuery })
