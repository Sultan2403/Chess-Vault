import type { PlatformType } from "../constants/platforms.js";

/**
 * Emitted by the BullMQ import worker via job.updateProgress() at each
 * meaningful milestone during a game import. The Socket.IO QueueEvents bridge
 * picks this up and forwards it to the user's room as `import:progress`.
 *
 * @property userId     - Clerk user ID — used to route the event to the correct Socket.IO room.
 * @property processed  - Total number of games processed so far in this job.
 * @property platform   - The platform being imported from.
 * @property archiveUrl - Chess.com only: the monthly archive URL currently being processed.
 */
export type ImportProgressPayload = {
  userId: string;
  processed: number;
  platform: PlatformType;
  archiveUrl?: string;
};

/**
 * The final result object stored as job.returnvalue when an import job completes.
 * The Socket.IO QueueEvents bridge emits this to the user's room as `import:complete`.
 */
export type ImportCompletePayload = {
  userId: string;
  success: boolean;
  message: string;
};
