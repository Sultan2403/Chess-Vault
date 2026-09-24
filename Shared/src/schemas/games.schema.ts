import { z } from "zod";
import { Platforms, Results, TimeClasses } from "../constants/index.js";
import { isValidMongoId } from "../utils/index.js";

export const PlatformValues = Object.values(Platforms);

export const importGamesParams = z.object({
  folderIds: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .refine(isValidMongoId, { message: "Invalid folder id" }),
    )
    .nullable()
    .default(null)
    .optional(),
  platform: z.enum(PlatformValues),
  username: z.string().trim().min(1, "Username is required"),
});

export const playerInputSchema = z.object({
  username: z.string().trim().min(1),
  rating: z.number().nonnegative(),
});

/** Opening details parsed from platform data or PGN headers */
export const openingSchema = z.object({
  /** ECO classification code (e.g. "C34"). Stored for display; not indexed. */
  eco: z.string().trim().max(10).optional(),
  /** Opening family name (e.g. "King's Gambit Accepted") */
  name: z.string().trim().max(100).optional(),
  /** Specific variation (e.g. "Fischer Defense") */
  variation: z.string().trim().max(100).optional(),
});

/** Move statistics: count (full moves) and plies (half-moves) */
export const movesSchema = z.object({
  /** Total number of full moves (rounds/turns) */
  count: z.number().int().nonnegative(),
  /** Total number of half-moves (plies) */
  plies: z.number().int().nonnegative(),
});

export const GameSchema = z.object({
  /** MongoDB ObjectId string assigned upon persistence in Chess Vault */
  id: z.string().trim().min(1),
  /** Clerk User ID of the owner of this game */
  userId: z.string().trim().min(1),
  /** Folder ObjectIds containing this game, or null if unorganized */
  folderIds: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .refine(isValidMongoId, { message: "Invalid folder id" }),
    )
    .nullable()
    .default(null),

  /** Source platform where game was played ("chess.com" | "lichess") */
  platform: z.enum(PlatformValues),
  /** Platform-assigned game identifier (e.g. Chess.com UUID or Lichess ID) */
  platformGameId: z.string().trim().min(1),

  /** Direct Web URL to the game on the source platform */
  sourceUrl: z.string().trim().min(1),

  /** Match title, formatted as `${whitePlayer.username} vs ${blackPlayer.username}` (or custom title) */
  title: z.string().trim().max(100).optional(),

  /** Details of White player ({ username, rating }) */
  whitePlayer: playerInputSchema,
  /** Details of Black player ({ username, rating }) */
  blackPlayer: playerInputSchema,
  /** Outcome of the match ("white" | "black" | "draw") */
  result: z.enum(Results),

  /** Whether the game was a rated match */
  isRated: z.boolean(),

  /** Standardized time control category */
  timeClass: z.enum(TimeClasses),

  /** Timestamp when game was played on source platform */
  playedAt: z.coerce.date(),
  /** Portable Game Notation string */
  pgn: z.string().min(1),

  /** User analysis or commentary */
  notes: z.string().trim().max(1000).optional(),
  /** User custom tag */
  tags: z.string().trim().max(20).optional(),

  /** Opening details: ECO code, opening family name, and variation */
  opening: openingSchema.optional(),

  /** Move statistics: count (full moves) and plies (half-moves) */
  moves: movesSchema.optional(),

  /** Timestamp when persisted in Chess Vault DB */
  createdAt: z.coerce.date().optional(),
  /** Timestamp when last updated in Chess Vault DB */
  updatedAt: z.coerce.date().optional(),
});

export const searchGamesQuery = z.object({
  folderIds: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .refine(isValidMongoId, { message: "Invalid folder id" }),
    )
    .nullable()
    .optional(),

  search: z.string().trim().max(100).optional(),

  platform: z.enum(PlatformValues).optional(),
  result: z.enum(Results).optional(),
  timeClass: z.enum(TimeClasses).optional(),

  isRated: z.preprocess((val: unknown) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),

  "opening.name": z.string().trim().max(100).optional(),
  "opening.variation": z.string().trim().max(100).optional(),

  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

export const gameParams = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Game ID is required")
    .refine(isValidMongoId, { message: "Invalid game id" }),
});

export const updateGameBody = z.object({
  title: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
  tags: z.string().trim().max(20).optional(),
  folderIds: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .refine(isValidMongoId, { message: "Invalid folder id" }),
    )
    .nullable()
    .optional(),
});

