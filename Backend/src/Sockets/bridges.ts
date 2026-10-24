import type { Server } from "socket.io";
import {
  SOCKET_EVENTS,
  type ImportProgressPayload,
  type ImportCompletePayload,
  type ImportFailedPayload,
} from "@chess-vault/shared";
import {
  importEvents,
  IMPORT_EVENT_NAMES,
} from "../Services/import.service";
import { logger } from "../Config/logger";

export const initializeImportBridge = (io: Server) => {
  importEvents.on(
    IMPORT_EVENT_NAMES.PROGRESS,
    (payload: ImportProgressPayload) => {
      const room = `user:${payload.userId}`;
      io.to(room).emit(SOCKET_EVENTS.IMPORT_PROGRESS, payload);

      logger.info(
        {
          importId: payload.importId,
          userId: payload.userId,
          platform: payload.platform,
          counters: payload.counters,
        },
        "Relayed import progress to user socket",
      );
    },
  );

  importEvents.on(
    IMPORT_EVENT_NAMES.COMPLETED,
    (payload: ImportCompletePayload) => {
      const room = `user:${payload.userId}`;
      io.to(room).emit(SOCKET_EVENTS.IMPORT_COMPLETE, payload);

      logger.info(
        {
          importId: payload.importId,
          userId: payload.userId,
          platform: payload.platform,
          status: payload.status,
          counters: payload.counters,
        },
        "Relayed import completion to user socket",
      );
    },
  );

  importEvents.on(
    IMPORT_EVENT_NAMES.FAILED,
    (payload: ImportFailedPayload) => {
      const room = `user:${payload.userId}`;
      io.to(room).emit(SOCKET_EVENTS.IMPORT_FAILED, payload);

      logger.warn(
        {
          importId: payload.importId,
          userId: payload.userId,
          platform: payload.platform,
          error: payload.error,
        },
        "Relayed import failure to user socket",
      );
    },
  );

  logger.info("Import domain socket bridge initialized");
};
