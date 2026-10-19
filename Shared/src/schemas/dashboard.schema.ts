import { z } from "zod";
import { Platforms } from "../constants/platforms.js";

export const dashboardQuerySchema = z.object({
  platform: z
    .enum([Platforms.CHESS_COM, Platforms.LICHESS, "all"])
    .optional()
    .default("all"),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
