import { verifyToken } from "@clerk/express";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import env from "../Config/env";
import type { EventHandler } from "../Types/socket.types";

/**
 * Handles the `join_user_room` socket event.
 *
 * The client sends its Clerk session token immediately after connecting.
 * The server verifies the token and places the socket into a user-scoped
 * room (`user:<userId>`), which is used to target import progress events.
 */
export const joinUserRoomHandler: EventHandler = async (payload, { socket }) => {
  const { token } = payload as { token?: string };

  if (!token) {
    socket.emit(SOCKET_EVENTS.BAD_PAYLOAD, { message: "Token required to join user room" });
    return;
  }

  try {
    const claims = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    const userId = claims.sub;
    await socket.join(`user:${userId}`);
  } catch {
    socket.emit(SOCKET_EVENTS.BAD_PAYLOAD, { message: "Invalid or expired token" });
    socket.disconnect();
  }
};
