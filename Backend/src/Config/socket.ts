import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { QueueEvents } from "bullmq";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import type {
  ImportProgressPayload,
  ImportCompletePayload,
} from "@chess-vault/shared";
import { RegisterEventHandler } from "../Types/socket.types";
import { joinUserRoomHandler } from "../Handlers/socket";
import redisClient from "../DB/Connections/redis";
import { logger } from "./logger";
import env from "./env";
import { QUEUE_NAMES } from "./constants";

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: { origin: env.ALLOWED_ORIGINS },
  });

  logger.info("Socket.IO server initialized");

  // --- BullMQ QueueEvents bridge ---
  const queueEvents = new QueueEvents(QUEUE_NAMES.IMPORT, {
    connection: redisClient,
  });

  queueEvents.on("progress", ({ jobId, data }) => {
    const { userId, ...payload } = data as ImportProgressPayload;
    const room = `user:${userId}`;
    const socketCount = io.sockets.adapter.rooms.get(room)?.size ?? 0;

    logger.debug(
      {
        jobId,
        userId,
        socketCount,
        payload,
      },
      "Relaying import progress to socket",
    );

    io.to(room).emit(SOCKET_EVENTS.IMPORT_PROGRESS, payload);
  });

  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    const { userId, ...payload } = returnvalue as ImportCompletePayload;
    const room = `user:${userId}`;
    const socketCount = io.sockets.adapter.rooms.get(room)?.size ?? 0;

    logger.info(
      {
        jobId,
        userId,
        socketCount,
        payload,
      },
      "Relaying import completion to socket",
    );

    io.to(room).emit(SOCKET_EVENTS.IMPORT_COMPLETE, payload);
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    logger.warn(
      { jobId, failedReason },
      "Import job failed (could not notify client)",
    );
  });

  // --- Socket.IO connection handling ---
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logger.info({ socketId: socket.id }, "Socket client connected");

    const registerEventHandler: RegisterEventHandler = (event, handler) => {
      socket.on(event, (payload: unknown) => {
        logger.debug(
          {
            socketId: socket.id,
            event,
          },
          "Socket event received",
        );

        handler(payload, { socket, io });
      });
    };

    registerEventHandler(SOCKET_EVENTS.JOIN_USER_ROOM, joinUserRoomHandler);

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info(
        {
          socketId: socket.id,
          reason,
        },
        "Socket client disconnected",
      );
    });
  });

  return io;
};
