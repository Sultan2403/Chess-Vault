import { Game } from "./games.types.js";
import { PlatformType } from "../constants/platforms.js";

export type DashboardSummaryMetrics = {
  totalGames: number;
  uniqueOpponents: number;
  totalCollections: number;
  deepStudies: number;
  dateRange: {
    firstGameAt: string | null;
    lastGameAt: string | null;
  };
};

export type DashboardRediscoverItem = {
  id: string;
  category: "milestoneWin" | "marathonBattle" | "notedStudy" | "quickDecisive";
  label: string;
  badgeText: string;
  game: Game;
  customQuote?: string;
};

export type DashboardOpeningTendency = {
  name: string;
  eco?: string;
  count: number;
  winRate: number;
};

export type DashboardTendencies = {
  wins: number;
  draws: number;
  losses: number;
  total: number;
  winPct: number;
  drawPct: number;
  lossPct: number;
  topOpenings: DashboardOpeningTendency[];
  longestGame: {
    movesCount: number;
    gameId: string;
    opponentUsername: string;
    result: string;
  } | null;
  sidePerformance: {
    whiteWinPct: number;
    blackWinPct: number;
  };
};

export type DashboardRecentGame = Game;

export type DashboardData = {
  platform: PlatformType | "all";
  metrics: DashboardSummaryMetrics;
  rediscover: DashboardRediscoverItem[];
  recentGames: DashboardRecentGame[];
  tendencies: DashboardTendencies;
};
