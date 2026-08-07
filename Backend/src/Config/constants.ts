export const Platforms = {
  CHESS_COM: "chess.com",
  LICHESS: "lichess",
} as const;

export type PlatformType = (typeof Platforms)[keyof typeof Platforms];

export const Results = ["white", "black", "draw"] as const;

export type ResultType = typeof Results[number];

export const MAX_GAMES_PER_USER = 1000;

export const PLANS_CONFIG = {
  free: {
    tier: "free",
    gameBankLimit: 1000,
    linkedAccountLimit: 2,
    aiEnabled: false,
    analyticsEnabled: false,
    sharingEnabled: false,
  },

  // pro: {
  //   tier: "pro",
  //   gameBankLimit: 10000,
  //   linkedAccountLimit: 10,
  //   aiEnabled: true,
  //   analyticsEnabled: true,
  //   sharingEnabled: true,
  // },
} as const;

export const planTypes = ["free", "pro"]

export const CLERK_WEBHOOK_EVENTS = {
  USER_CREATED: "user.created",
  USER_DELETED: "user.deleted",
  USER_UPDATED: "user.updated",
}