import { PlatformType } from "../constants/platforms.js";
import { TimeClassType, TerminationValuesType } from "../constants/games.js";

export type AnalyticsOverview = {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
  lossPct: number;
  drawPct: number;
  avgMoves: number;
  white: {
    total: number;
    wins: number;
    losses: number;
    draws: number;
    winPct: number;
  };
  black: {
    total: number;
    wins: number;
    losses: number;
    draws: number;
    winPct: number;
  };
  rated: {
    total: number;
    wins: number;
    winPct: number;
  };
};

export type AnalyticsPlatformStat = {
  platform: PlatformType;
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
};

export type AnalyticsTimeClassStat = {
  timeClass: TimeClassType;
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
};

export type AnalyticsOpeningStat = {
  name: string;
  eco?: string;
  color: "white" | "black";
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
};

export type AnalyticsOpenings = {
  asWhite: AnalyticsOpeningStat[];
  asBlack: AnalyticsOpeningStat[];
  signatureWeapon: AnalyticsOpeningStat | null;
  vulnerableOpening: AnalyticsOpeningStat | null;
};

export type AnalyticsOpponentStat = {
  username: string;
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
};

export type AnalyticsOpponents = {
  totalUnique: number;
  topRivals: AnalyticsOpponentStat[];
  milestoneVictory: {
    opponentUsername: string;
    opponentRating: number;
    playedAt: Date | string;
    gameId: string;
    timeClass: string;
    userPlayedAs: "white" | "black";
  } | null;
};

export type AnalyticsTerminationStat = {
  termination: TerminationValuesType | string;
  userResult: "win" | "loss" | "draw";
  count: number;
  percentage: number;
};

export type AnalyticsTerminations = {
  winWays: {
    checkmate: number;
    resignation: number;
    timeout: number;
    other: number;
  };
  lossWays: {
    checkmate: number;
    resignation: number;
    timeout: number;
    other: number;
  };
  breakdown: AnalyticsTerminationStat[];
};

export type AnalyticsMoveBucket = {
  bucket: "fast" | "medium" | "long";
  label: string;
  count: number;
  wins: number;
  winPct: number;
};

export type AnalyticsActivityTrend = {
  period: string; // "YYYY-MM"
  count: number;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
};

export type AnalyticsStreaks = {
  currentStreak: {
    count: number;
    type: "win" | "loss" | "draw" | "none";
  };
  longestWinStreak: number;
};

export type AnalyticsData = {
  query: {
    platform: PlatformType | "all";
    timeClass: TimeClassType | "all";
    from?: string;
    to?: string;
  };
  overview: AnalyticsOverview;
  byPlatform: AnalyticsPlatformStat[];
  byTimeClass: AnalyticsTimeClassStat[];
  openings: AnalyticsOpenings;
  opponents: AnalyticsOpponents;
  terminations: AnalyticsTerminations;
  moveBuckets: AnalyticsMoveBucket[];
  activityTrends: AnalyticsActivityTrend[];
  streaks: AnalyticsStreaks;
};
