import type { LinkedAccount } from "@chess-vault/shared";

export type PlatformConnection = Pick<
  LinkedAccount,
  "id" | "platform" | "username" | "lastSyncedAt"
> & { connected: boolean };

export type Collection = {
  title: string;
  entries: number;
  description: string;
  variant: "feature" | "compact" | "dark";
};
