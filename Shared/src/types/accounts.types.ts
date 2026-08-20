import { PlatformType } from "../constants/platforms.js";
import { PlanType } from "../constants/plans.js";

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

export type LinkedAccount = {
  id: string;
  userId: string;
  platform: PlatformType;
  username: string;
  lastSyncedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
