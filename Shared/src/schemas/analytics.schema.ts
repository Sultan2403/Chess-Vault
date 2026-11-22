import { z } from "zod";
import { Platforms } from "../constants/platforms.js";
import { TimeClasses } from "../constants/games.js";

export const analyticsQuerySchema = z.object({
  platform: z
    .enum([Platforms.CHESS_COM, Platforms.LICHESS, "all"])
    .optional()
    .default("all"),
  timeClass: z
    .enum([...TimeClasses, "all"])
    .optional()
    .default("all"),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
