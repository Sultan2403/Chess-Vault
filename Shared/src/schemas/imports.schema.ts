import { z } from "zod";
import { IMPORT_TRIGGERS } from "../constants/imports.js";
import { isValidMongoId } from "../utils/index.js";

export const startImportBody = z.object({
  linkedAccountId: z
    .string()
    .trim()
    .min(1, "linkedAccountId is required")
    .refine(isValidMongoId, { message: "Invalid linkedAccountId" }),
  trigger: z.enum(IMPORT_TRIGGERS).optional(),
});

export const getImportHistoryQuery = z.object({
  status: z.string().trim().optional(),
});

export type StartImportInput = z.infer<typeof startImportBody>;
export type GetImportHistoryQuery = z.infer<typeof getImportHistoryQuery>;
