export const Platforms = {
  CHESS_COM: "chess.com",
  LICHESS: "lichess",
} as const;

export type PlatformType = typeof Platforms[keyof typeof Platforms];

export const Results = ["white", "black", "draw"] as const;

export const MAX_GAMES_PER_USER = 1000;