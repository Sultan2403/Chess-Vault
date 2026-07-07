import { z } from "zod";
import { Platforms, Results } from "../Config/constants";

export const playerInputSchema = z.object({
  username: z.string().trim().min(1),
  rating: z.number().nonnegative(),
});

export const GameSchema = z.object({
  userId: z.string().trim().min(1),

  folderId: z.string().trim().min(1),

  platform: z.enum(Platforms),
  platformGameId: z.string().trim().min(1),

  sourceUrl: z.string().trim().min(1),

  title: z.string().trim().max(100).optional(),

  whitePlayer: playerInputSchema,
  blackPlayer: playerInputSchema,
  result: z.enum(Results),

  timeControl: z.string().trim().min(1),
  timeClass: z.string().trim().min(1),

  playedAt: z.coerce.date(),
  pgn: z.string().min(1),

  notes: z.string().trim().max(1000).optional(),
  tags: z.string().trim().max(20).optional(),
});


