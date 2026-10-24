import type { PlatformType } from "../constants/platforms.js";
import type {
  ImportStatus,
  ImportTrigger,
} from "../constants/imports.js";

export type ImportCounters = {
  fetched: number;
  inserted: number;
  duplicates: number;
  skipped: number;
};

export type ImportError = {
  code: string;
  message: string;
};

export type Import = {
  id: string;
  userId: string;
  linkedAccountId: string;
  platform: PlatformType;
  trigger: ImportTrigger;
  status: ImportStatus;
  counters: ImportCounters;
  error?: ImportError;
  startedAt: Date | string;
  finishedAt?: Date | string;
  jobRef?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

/**
 * Emitted during an import run to report live progress.
 */
export type ImportProgressPayload = {
  userId: string;
  importId: string;
  platform: PlatformType;
  counters: ImportCounters;
  vaultUsage?: {
    current: number;
    limit: number;
  };
};

/**
 * Emitted when an import run reaches a terminal state (completed or partial).
 */
export type ImportCompletePayload = {
  userId: string;
  importId: string;
  platform: PlatformType;
  status: "completed" | "partial";
  counters: ImportCounters;
  message?: string;
};

/**
 * Emitted when an import run fails due to an error.
 */
export type ImportFailedPayload = {
  userId: string;
  importId: string;
  platform: PlatformType;
  error: ImportError;
};
