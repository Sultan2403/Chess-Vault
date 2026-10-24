import { PlatformType } from "@chess-vault/shared";

export type ImportJobData = {
  importId: string;
  userId: string;
  linkedAccountId: string;
  platform: PlatformType;
};

export type PurgeUserJobData = {
  userId: string;
};
