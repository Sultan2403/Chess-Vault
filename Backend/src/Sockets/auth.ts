import { verifyToken } from "@clerk/express";
import env from "../Config/env";
import type { Socket } from "socket.io";
import { logger } from "../Config/logger";

/**
 * Authenticates an incoming Socket.IO connection using a Clerk session token.
 *
 * The client provides its token through the Socket.IO handshake auth payload.
 * When authentication succeeds, the authenticated user's ID is attached to
 * `socket.data` and the socket joins the user's private room.
 *
 * Authentication failures reject the connection before the Socket.IO
 * `connection` event is emitted.
 */
export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  const token = socket.handshake.auth?.token;

  if (!token || typeof token !== "string") {
    logger.warn({ socketId: socket.id }, "Socket connection rejected: missing auth token");
    next(new Error("Authentication required"));
    return;
  }

  try {
    const claims = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    const userId = claims.sub;

    socket.data.userId = userId;
    await socket.join(`user:${userId}`);
    logger.debug({ userId }, "Socket authenticated and joined successfully");

    next();
  } catch (err) {
    logger.warn({ err, socketId: socket.id }, "Socket authentication failed: invalid or expired token");
    next(new Error("Invalid or expired authentication token"));
  }
};