import { Worker } from "bullmq";
import redisClient from "../DB/Connections/redis";
import { importGames } from "../Services/games.service";
import { logger } from "../Config/logger";
import type { ImportJobData } from "../Types/jobs.types";
import type { ImportProgressPayload, ImportCompletePayload } from "@chess-vault/shared";
import { QUEUE_NAMES } from "../Config/constants";

export const importWorker = new Worker<ImportJobData, ImportCompletePayload>(
  QUEUE_NAMES.IMPORT,
  async (job) => {
    const { userId, username, platform, folderIds } = job.data;

    const onProgress = async (payload: ImportProgressPayload) => {
      await job.updateProgress(payload);
    };

    const result = await importGames(
      { userId, username, platform, folderIds },
      onProgress,
    );

    // Return value is stored as job.returnvalue and forwarded by QueueEvents
    return {
      userId,
      success: result.success,
      message: result.message ?? (result.success ? "Import complete" : "Import failed"),
    };
  },
  { connection: redisClient },
);

importWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, userId: job.data.userId }, "Import job completed");
});

importWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, userId: job?.data.userId, err }, "Import job failed");
});
