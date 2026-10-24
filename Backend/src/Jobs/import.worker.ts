import { Worker, Job } from "bullmq";
import { BullMQRedis } from "../DB/Connections/redis";
import type { ImportJobData } from "../Types/jobs.types";
import { QUEUE_NAMES } from "../Config/constants";
import {
  importService,
  importEvents,
  IMPORT_EVENT_NAMES,
} from "../Services/import.service";
import Imports from "../DB/Models/imports.model";
import LinkedAccounts from "../DB/Models/linked_accounts.model";
import { logger } from "../Config/logger";
import { ImportFailedPayload } from "@chess-vault/shared";

const processImportJob = async (job: Job<ImportJobData>) => {
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

/**
 * Fallback reconciler for unexpected job crashes or unhandled failures at the worker level.
 * Guarantees no Import document stays stranded in "queued" or "running".
 */
const handleWorkerJobFailure = async (
  job: Job<ImportJobData> | undefined,
  err: Error,
) => {
  if (!job) return;

  const { importId, linkedAccountId, platform, userId } = job.data;
  logger.error(
    { jobId: job.id, importId, err },
    "Import worker job encountered unhandled failure",
  );

  try {
    const importDoc = await Imports.findById(importId);
    if (importDoc && (importDoc.status === "queued" || importDoc.status === "running")) {
      const error = {
        code: "WORKER_JOB_FAILED",
        message: err?.message || "Worker job execution failed",
      };

      importDoc.status = "failed";
      importDoc.error = error;
      importDoc.finishedAt = new Date();
      await importDoc.save();

      await LinkedAccounts.updateOne(
        { _id: linkedAccountId },
        { syncStatus: "needs_attention" },
      );

      importEvents.emit(IMPORT_EVENT_NAMES.FAILED, {
        userId,
        importId,
        platform,
        error,
      } as ImportFailedPayload);
    }
  } catch (reconcileErr) {
    logger.error({ reconcileErr, importId }, "Failed to reconcile failed import job");
  }
};

// Dedicated worker for Chess.com (Concurrency 1 ensures rate-limit safe serial requests across all users)
export const chessComWorker = new Worker<ImportJobData>(
  QUEUE_NAMES.IMPORT_CHESS_COM,
  processImportJob,
  {
    connection: BullMQRedis,
    concurrency: 1,
  },
);

chessComWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, importId: job.data.importId }, "Chess.com import job completed");
});

chessComWorker.on("failed", (job, err) => {
  handleWorkerJobFailure(job, err);
});

// Dedicated worker for Lichess (Concurrency 1 ensures rate-limit safe serial requests across all users)
export const lichessWorker = new Worker<ImportJobData>(
  QUEUE_NAMES.IMPORT_LICHESS,
  processImportJob,
  {
    connection: BullMQRedis,
    concurrency: 1,
  },
);

lichessWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, importId: job.data.importId }, "Lichess import job completed");
});

lichessWorker.on("failed", (job, err) => {
  handleWorkerJobFailure(job, err);
});
