import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { QueueEvents } from "bullmq";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import type { ImportProgressPayload, ImportCompletePayload } from "@chess-vault/shared";
import { RegisterEventHandler } from "../Types/socket.types";
import { joinUserRoomHandler } from "../Handlers/socket";
import redisClient from "../DB/Connections/redis";
import { logger } from "./logger";
import env from "./env";

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: { origin: env.ALLOWED_ORIGINS },
  });

  // --- BullMQ QueueEvents bridge ---
  // QueueEvents subscribes to BullMQ's Redis pub/sub channel for the import
  // queue. When the worker calls job.updateProgress() or the job completes/
  // fails, these listeners fire in the main server process and relay the event
  // to the correct user's Socket.IO room.
  const queueEvents = new QueueEvents("import", { connection: redisClient });

  queueEvents.on("progress", ({ data }) => {
    const { userId, ...payload } = data as ImportProgressPayload;
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.IMPORT_PROGRESS, payload);
  });

  queueEvents.on("completed", ({ returnvalue }) => {
    const { userId, ...payload } = returnvalue as ImportCompletePayload;
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.IMPORT_COMPLETE, payload);
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    // jobId is all we have here — userId isn't available without a DB lookup.
    // For now we log; a future improvement could store jobId→userId in a Map
    // set at enqueue time to be able to emit IMPORT_FAILED to the right room.
    logger.warn({ jobId, failedReason }, "Import job failed (could not notify client)");
  });

  // --- Socket.IO connection handling ---
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const registerEventHandler: RegisterEventHandler = (event, handler) => {
      socket.on(event, (payload: unknown) => handler(payload, { socket, io }));
    };

    registerEventHandler(SOCKET_EVENTS.JOIN_USER_ROOM, joinUserRoomHandler);

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {});
  });

  return io;
};
