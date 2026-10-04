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
    logger.info({ socketId: socket.id }, "Socket client connected");

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
