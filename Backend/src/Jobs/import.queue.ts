import { Queue, QueueEvents } from "bullmq";
import { BullMQRedis } from "../DB/Connections/redis";
import type { ImportJobData } from "../Types/jobs.types";
import { QUEUE_NAMES, JOB_NAMES } from "../Config/constants";
import { Platforms, PlatformType } from "@chess-vault/shared";

export const chessComImportQueue = new Queue<ImportJobData>(
  QUEUE_NAMES.IMPORT_CHESS_COM,
  {
    connection: BullMQRedis,
  },
);

export const lichessImportQueue = new Queue<ImportJobData>(
  QUEUE_NAMES.IMPORT_LICHESS,
  {
    connection: BullMQRedis,
  },
);

export const IMPORT_QUEUES: Record<PlatformType, Queue<ImportJobData>> = {
  [Platforms.CHESS_COM]: chessComImportQueue,
  [Platforms.LICHESS]: lichessImportQueue,
};

export const chessComQueueEvents = new QueueEvents(
  QUEUE_NAMES.IMPORT_CHESS_COM,
  {
    connection: BullMQRedis,
  },
);

export const lichessQueueEvents = new QueueEvents(
  QUEUE_NAMES.IMPORT_LICHESS,
  {
    connection: BullMQRedis,
  },
);

/**
 * Enqueue an import job onto the platform-specific queue.
 * - Uses `jobId: `${data.linkedAccountId}-${data.importId}`` to ensure each distinct run gets a unique job.
 * - Removes old completed or failed jobs so Redis never gets clogged or blocks future runs.
 */
export const enqueueImportJob = async (data: ImportJobData) => {
  const queue = IMPORT_QUEUES[data.platform];
  const jobId = `${data.linkedAccountId}-${data.importId}`;

  return queue.add(JOB_NAMES.IMPORT_RUN, data, {
    jobId,
    removeOnComplete: true,
    removeOnFail: true,
  });
};
