import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import { RegisterEventHandler } from "../Types/socket.types";
import env from "./env";

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: { origin: env.ALLOWED_ORIGINS },
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    // Helper func to initialize handlers with necessary context down the line.

    const registerEventHandler: RegisterEventHandler = (event, handler) => {
      socket.on(event, (payload: unknown) => handler(payload, { socket, io }));
    };

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {});
  });

  return io;
};
