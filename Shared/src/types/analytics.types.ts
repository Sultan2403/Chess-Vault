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
  practicalOutcomeIndex: number; // winPct + (drawPct / 2)
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
  volumePct: number;
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
  signatureWeapons: AnalyticsOpeningStat[];
  vulnerableOpenings: AnalyticsOpeningStat[];
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
  platform?: PlatformType;
  rating?: number;
  lastPlayedAt?: Date | string;
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
  bucket: string;
  label: string;
  count: number;
  wins: number;
  winPct: number;
  percentage: number;
};

export type AnalyticsGameHighlight = {
  gameId: string;
  opponentUsername: string;
  opponentRating?: number;
  movesCount: number;
  plies: number;
  termination: string;
  playedAt: Date | string;
};

export type AnalyticsGameLength = {
  meanMoves: number;
  medianMoves: number;
  quickestWin: AnalyticsGameHighlight | null;
  longestGame: AnalyticsGameHighlight | null;
};

export type AnalyticsRatingBracket = {
  bracket: string;
  label: string;
  total: number;
  wins: number;
  winPct: number;
};

export type AnalyticsPlatformRatingBrackets = {
  platform: PlatformType;
  brackets: AnalyticsRatingBracket[];
};

export type AnalyticsArchiveSpan = {
  firstGameAt: string | null;
  lastGameAt: string | null;
  formattedSpan: string;
};

export type AnalyticsActivityTrend = {
  period: string; // "YYYY-MM"
  count: number;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
};

export type AnalyticsOptimalWindow = {
  dayOfWeek: string;
  timeSlot: string;
  gamesCount: number;
  winPct: number;
};

export type AnalyticsRatingPoint = {
  period: string; // "YYYY-MM"
  avgRating: number;
  gamesPlayed: number;
};

export type AnalyticsPlatformRatingProgression = {
  platform: PlatformType;
  data: AnalyticsRatingPoint[];
};

export type AnalyticsStreaks = {
  currentStreak: {
    count: number;
    type: "win" | "loss" | "draw" | "none";
  };
  longestWinStreak: number;
  longestLossStreak: number;
  longestDrawStreak: number;
};

export type AnalyticsData = {
  query: {
    platform: PlatformType | "all";
    timeClass: TimeClassType | "all";
    from?: string;
    to?: string;
  };
  overview: AnalyticsOverview;
  archiveSpan: AnalyticsArchiveSpan;
  byPlatform: AnalyticsPlatformStat[];
  byTimeClass: AnalyticsTimeClassStat[];
  openings: AnalyticsOpenings;
  opponents: AnalyticsOpponents;
  terminations: AnalyticsTerminations;
  moveBuckets: AnalyticsMoveBucket[];
  gameLength: AnalyticsGameLength;
  ratingBrackets: AnalyticsPlatformRatingBrackets[];
  optimalWindow: AnalyticsOptimalWindow | null;
  activityTrends: AnalyticsActivityTrend[];
  ratingProgression: AnalyticsPlatformRatingProgression[];
  streaks: AnalyticsStreaks;
};
