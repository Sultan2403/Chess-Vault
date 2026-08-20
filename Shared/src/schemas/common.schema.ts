import { z } from "zod";
import { isValidMongoId, toNumberOrUndefined } from "../utils/index.js";

export const mongoIdSchema = z.string().trim().min(1).refine(isValidMongoId, {
  message: "Invalid ID format",
});

export const paginationQuerySchema = z.object({
  page: z.preprocess(toNumberOrUndefined, z.number().int().positive().optional()),
  limit: z.preprocess(toNumberOrUndefined, z.number().int().positive().optional()),
});
