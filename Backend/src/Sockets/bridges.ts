import type { Server } from "socket.io";
import {
  SOCKET_EVENTS,
  type ImportProgressPayload,
  type ImportCompletePayload,
} from "@chess-vault/shared";
import { importQueue, importQueueEvents } from "../Jobs/import.queue";
import { QUEUE_NAMES } from "../Config/constants";
import { logger } from "../Config/logger";

export const initializeImportBridge = (io: Server) => {
  importQueueEvents.on("progress", ({ jobId, data }) => {
    const { userId, ...payload } = data as ImportProgressPayload;

    const room = `user:${userId}`;

    io.to(room).emit(SOCKET_EVENTS.IMPORT_PROGRESS, payload);

    logger.info(
      {
        jobId,
        userId,
        payload,
      },
      "Relayed import progress to socket",
    );
  });

  importQueueEvents.on("completed", ({ jobId, returnvalue }) => {
    const { userId, ...payload } = returnvalue as ImportCompletePayload;

    const room = `user:${userId}`;

    io.to(room).emit(SOCKET_EVENTS.IMPORT_COMPLETE, payload);

    logger.info(
      {
        jobId,
        userId,
        payload,
      },
      "Relayed import completion to socket",
    );
  });

  importQueueEvents.on("failed", async ({ jobId, failedReason }) => {
    logger.warn({ jobId, failedReason }, "Import job failed");

    try {
      const job = await importQueue.getJob(jobId);
      if (job?.data?.userId) {
        const room = `user:${job.data.userId}`;
        io.to(room).emit(SOCKET_EVENTS.IMPORT_COMPLETE, {
          success: false,
          message: failedReason || "Import job failed",
        });
        logger.info(
          { jobId, userId: job.data.userId, failedReason },
          "Relayed import failure to socket",
        );
      }
    } catch (err) {
      logger.error({ jobId, err }, "Failed to relay job failure to user socket");
    }
  });

  logger.info({ queue: QUEUE_NAMES.IMPORT }, "Import event bridge initialized");

  return importQueueEvents;
};
