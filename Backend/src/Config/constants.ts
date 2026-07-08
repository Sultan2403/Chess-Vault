export const Platforms = {
  CHESS_COM: "chess.com",
  LICHESS: "lichess",
} as const;

export type PlatformType = typeof Platforms[keyof typeof Platforms];

export const Results = ["white", "black", "draw"] as const;
