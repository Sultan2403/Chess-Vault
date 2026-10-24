import { Worker } from "bullmq";
import * as Sentry from "@sentry/node";
import { BullMQRedis } from "../DB/Connections/redis";
import { purgeUserData } from "../Services/purge.service";
import { logger } from "../Config/logger";
import type { PurgeUserJobData } from "../Types/jobs.types";
import { QUEUE_NAMES } from "../Config/constants";

export const purgeWorker = new Worker<PurgeUserJobData>(
  QUEUE_NAMES.PURGE_USER,
  async (job) => {
    const { userId } = job.data;
    await purgeUserData({ userId });
  },
  { connection: { BullMQRedis } },
);

purgeWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, userId: job.data.userId }, "Purge job completed");
});

purgeWorker.on("failed", (job, err) => {
  const isExhausted =
    job !== undefined &&
    job.opts.attempts !== undefined &&
    job.attemptsMade >= job.opts.attempts;

  if (isExhausted) {
    logger.fatal(
      { jobId: job?.id, userId: job?.data.userId, err },
      "Purge job exhausted all retries — user data may not be fully deleted",
    );
    Sentry.captureException(err, {
      extra: { jobId: job?.id, userId: job?.data.userId },
    });
  } else {
    logger.error(
      { jobId: job?.id, userId: job?.data.userId, err, attempt: job?.attemptsMade },
      "Purge job attempt failed — will retry",
    );
  }
});
