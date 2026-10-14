export * from "@chess-vault/shared";

export const CLERK_WEBHOOK_EVENTS = {
  USER_CREATED: "user.created",
  USER_DELETED: "user.deleted",
  USER_UPDATED: "user.updated",
} as const;

export const QUEUE_NAMES = {
  IMPORT: "import_queue",
  PURGE_USER: "purge_user_queue",
} as const;

export const JOB_NAMES = {
  IMPORT: "import_games",
  PURGE_USER: "purge_user_data",
} as const;
