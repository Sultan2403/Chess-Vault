import { z } from "zod";
import { Platforms, Results } from "../Config/constants";
import { isValidMongoId } from "../Utils";

const PlatformValues = Object.values(Platforms);

export const importGamesParams = z.object({
  folderId: z.string().trim().min(1).refine(isValidMongoId, {
    message: "Invalid folder id",
  }),
  platform: z.enum(PlatformValues),
  username: z.string().trim().min(1),
});

const playerInputSchema = z.object({
  username: z.string().trim().min(1),
  rating: z.number().nonnegative(),
});

export const GameSchema = z.object({
  userId: z.string().trim().min(1),

  folderId: z.string().trim().min(1),

  platform: z.enum(PlatformValues),
  platformGameId: z.string().trim().min(1),

  sourceUrl: z.string().trim().min(1),

  title: z.string().trim().max(100).optional(),

  whitePlayer: playerInputSchema,
  blackPlayer: playerInputSchema,
  result: z.enum(Results),

  isRated: z.boolean(),

  timeClass: z.string().trim().min(1),

  playedAt: z.coerce.date(),
  pgn: z.string().min(1),

  notes: z.string().trim().max(1000).optional(),
  tags: z.string().trim().max(20).optional(),

  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const searchGamesQuery = z.object({
  folderId: z
    .string()
    .trim()
    .refine(isValidMongoId, { message: "Invalid folder id" })
    .optional(),

  search: z.string().trim().max(100).optional(),

  platform: z.enum(PlatformValues).optional(),
  result: z.enum(Results).optional(),
  timeClass: z.string().trim().optional(),

  isRated: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean().optional()),

  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

export const searchGamesParamsSchema = searchGamesQuery.extend({
  userId: z.string().trim().min(1),
});



