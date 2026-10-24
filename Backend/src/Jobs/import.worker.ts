import { Worker, Job } from "bullmq";
import { BullMQRedis } from "../DB/Connections/redis";
import type { ImportJobData } from "../Types/jobs.types";
import { QUEUE_NAMES } from "../Config/constants";
import { importService } from "../Services/import.service";
import { logger } from "../Config/logger";

const processJob = async (job: Job<ImportJobData>) => {
  logger.info(
    {
      jobId: job.id,
      importId: job.data.importId,
      platform: job.data.platform,
      userId: job.data.userId,
    },
    "Processing import job",
  );

  await importService.processImportRun(job.data.importId);
};

// Dedicated worker for Chess.com (Concurrency 1 ensures rate-limit safe serial requests across all users)
export const chessComWorker = new Worker<ImportJobData>(
  QUEUE_NAMES.IMPORT_CHESS_COM,
  processJob,
  {
    connection: BullMQRedis,
    concurrency: 1,
  },
);

chessComWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, importId: job.data.importId }, "Chess.com import job completed");
});

chessComWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, importId: job?.data.importId, err }, "Chess.com import job failed");
});

// Dedicated worker for Lichess (Concurrency 1 ensures rate-limit safe serial requests across all users)
export const lichessWorker = new Worker<ImportJobData>(
  QUEUE_NAMES.IMPORT_LICHESS,
  processJob,
  {
    connection: BullMQRedis,
    concurrency: 1,
  },
);

lichessWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, importId: job.data.importId }, "Lichess import job completed");
});

lichessWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, importId: job?.data.importId, err }, "Lichess import job failed");
});
