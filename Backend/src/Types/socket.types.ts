import { Socket, Server } from "socket.io";

export type SocketContext = {
  socket: Socket;
  io: Server;

  // More stuff if needed...
};

export type EventHandler = (
  payload: unknown,
  context: SocketContext,
) => void | Promise<void>;

export type RegisterEventHandler = (
  event: string,
  handler: EventHandler,
) => void;

