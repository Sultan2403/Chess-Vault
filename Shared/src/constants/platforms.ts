export const Platforms = {
  CHESS_COM: "chess.com",
  LICHESS: "lichess",
} as const;

export const PlatformValues = Object.values(Platforms);

export type PlatformType = (typeof Platforms)[keyof typeof Platforms];
