import { useEffect, useState } from "react";
import socket, { connectSocket, disconnectSocket } from "../sockets/socket";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import type {
  ImportCompleteType,
  ImportProgressType,
  ImportFailedType,
} from "../types/socket";
import { QUERY_KEYS } from "../constants/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

export type ImportNotification = {
  id: string;
  type: "success" | "warning" | "error";
  platform: string;
  message: string;
  timestamp: number;
};

export const useImportNotifications = () => {
  const [activeNotification, setActiveNotification] =
    useState<ImportNotification | null>(null);
  const [importProgress, setImportProgress] =
    useState<ImportProgressType | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    connectSocket();

    const handleProgress = (payload: ImportProgressType) => {
      setImportProgress(payload);
    };

    const handleComplete = (payload: ImportCompleteType) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.bootstrap() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.imports.all });

      const platformLabel =
        payload.platform === "chess.com" ? "Chess.com" : "Lichess";
      const count = payload.counters?.inserted ?? 0;
      const message =
        payload.status === "partial"
          ? `${platformLabel} import capped: ${count} games added.`
          : `${platformLabel} import complete: ${count} games added.`;

      setActiveNotification({
        id: payload.importId,
        type: payload.status === "partial" ? "warning" : "success",
        platform: payload.platform,
        message,
        timestamp: Date.now(),
      });

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setActiveNotification((curr) =>
          curr?.id === payload.importId ? null : curr,
        );
      }, 6000);
    };

    const handleFailed = (payload: ImportFailedType) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.imports.all });

      const platformLabel =
        payload.platform === "chess.com" ? "Chess.com" : "Lichess";
      setActiveNotification({
        id: payload.importId,
        type: "error",
        platform: payload.platform,
        message: `${platformLabel} import failed: ${payload.error?.message || "Unknown error"}`,
        timestamp: Date.now(),
      });

      setTimeout(() => {
        setActiveNotification((curr) =>
          curr?.id === payload.importId ? null : curr,
        );
      }, 8000);
    };

    socket.on(SOCKET_EVENTS.IMPORT_PROGRESS, handleProgress);
    socket.on(SOCKET_EVENTS.IMPORT_COMPLETE, handleComplete);
    socket.on(SOCKET_EVENTS.IMPORT_FAILED, handleFailed);

    return () => {
      socket.off(SOCKET_EVENTS.IMPORT_PROGRESS, handleProgress);
      socket.off(SOCKET_EVENTS.IMPORT_COMPLETE, handleComplete);
      socket.off(SOCKET_EVENTS.IMPORT_FAILED, handleFailed);
      disconnectSocket();
    };
  }, [queryClient]);

  const dismiss = () => setActiveNotification(null);

  return {
    activeNotification,
    importProgress,
    dismiss,
  };
};
