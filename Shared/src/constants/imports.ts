export const SYNC_STATUSES = [
  "never_imported",
  "healthy",
  "needs_attention",
] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const IMPORT_TRIGGERS = [
  "onboarding",
  "manual",
  "scheduled",
] as const;
export type ImportTrigger = (typeof IMPORT_TRIGGERS)[number];

export const IMPORT_STATUSES = [
  "queued",
  "running",
  "completed",
  "partial",
  "failed",
] as const;
export type ImportStatus = (typeof IMPORT_STATUSES)[number];
