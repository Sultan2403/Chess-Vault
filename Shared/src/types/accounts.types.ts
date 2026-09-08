import type { PlatformType } from "../constants/platforms.js";
import type { PlanType } from "../constants/plans.js";
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

export type LinkedAccount = {
  id: string;
  userId: string;
  platform: PlatformType;
  username: string;
  lastSyncedAt?: Date | string | null;
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
