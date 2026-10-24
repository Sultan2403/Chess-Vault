import type { PlatformType } from "../constants/platforms.js";
import type { PlanType } from "../constants/plans.js";
import type { SyncStatus } from "../constants/imports.js";
import type {
  connectLinkedAccountsBody,
  linkedAccountParams,
} from "../schemas/accounts.schema.js";
import { z } from "zod";

export type AccountPlan = {
  tier: PlanType;
  gameBankLimit: number;
  linkedAccountLimit: number;
  aiEnabled: boolean;
  analyticsEnabled: boolean;
  sharingEnabled: boolean;
};

export type Account = {
  id: string;
  userId: string;
  plan: AccountPlan;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type LinkedAccountCursor = {
  lastArchiveUrl?: string | null;
  lastGamePlayedAt?: number | null;
};

export type LinkedAccount = {
  id: string;
  userId: string;
  platform: PlatformType;
  username: string;
  lastSyncedAt?: Date | string | null;
  cursor?: LinkedAccountCursor | null;
  syncStatus: SyncStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type ConnectLinkedAccountsInput = z.infer<
  typeof connectLinkedAccountsBody
>;

export type LinkedAccountParams = z.infer<typeof linkedAccountParams>;

export type AccountBootstrap = {
  account: Account;
  linkedAccounts: LinkedAccount[];
  needsOnboarding: boolean;
  hasGames: boolean;
};

export type LinkedAccountConnectionResult = {
  platform: PlatformType;
  username: string;
  success: boolean;
  message?: string;
};

export type ConnectLinkedAccountsResult = {
  success: boolean;
  message: string;
  results: LinkedAccountConnectionResult[];
  linkedAccounts: LinkedAccount[];
};

export type VerifyLinkedAccountResult = {
  success: boolean;
  username: string;
  message?: string;
};

export type ChessComPlayerProfile = {
  username: string;
  title?: string;
  avatar?: string;
  joined?: number;
  country?: string;
  status?: string;
  fide?: number;
};

export type LichessPlayerProfile = {
  title?: string;
  createdAt: number;
  tosViolation?: boolean;
  country?: string;
  location?: string;
  bio?: string;
  fideRating?: number;
};

export type AccountsStatsPreviewResult = {
  chessCom?: {
    username: string;
    profile: ChessComPlayerProfile;
    stats?: import("./games.types.js").Chess_Com_Player_Stats;
  };
  lichess?: {
    username: string;
    profile: LichessPlayerProfile;
    stats: {
      perfs: import("./games.types.js").Lichess_Perfs;
      count?: import("./games.types.js").Lichess_Count;
      playTime?: import("./games.types.js").Lichess_PlayTime;
    };
  };
};
