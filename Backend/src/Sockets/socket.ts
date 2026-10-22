import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import { authenticateSocket } from "./auth";
import { initializeImportBridge } from "./bridges";
import { logger } from "../Config/logger";
import env from "../Config/env";

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: { origin: env.ALLOWED_ORIGINS },
  });

  io.use(authenticateSocket);
  initializeImportBridge(io);

  logger.info("Socket.IO server initialized");

  // --- Socket.IO connection handling ---
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const userId = socket.data.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    logger.info(
      {
        socketId: socket.id,
        userId,
        rooms: Array.from(socket.rooms),
      },
      "Socket client connected and ready",
    );

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info(
        {
          socketId: socket.id,
          userId: socket.data.userId,
          reason,
        },
        "Socket client disconnected",
      );
    });
  });

  return io;
};
