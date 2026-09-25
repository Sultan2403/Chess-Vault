import { PlatformType } from "@chess-vault/shared";

export type ImportJobData = {
  userId: string;
  username: string;
  platform: PlatformType;
  folderIds: string[] | null;
};
