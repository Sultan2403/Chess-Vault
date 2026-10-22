import { useEffect, useState } from "react";
import socket, { connectSocket, disconnectSocket } from "../sockets/socket";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import type { ImportCompleteType, ImportProgressType } from "../types/socket";
import { QUERY_KEYS } from "../constants/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

export const useImportProgress = () => {
  const [importProgress, setImportProgress] =
    useState<ImportProgressType | null>(null);
  const [importComplete, setImportComplete] =
    useState<ImportCompleteType | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    connectSocket();

    const handleImportProgress = (payload: ImportProgressType) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.games.lists(),
      });
      setImportProgress(payload);
    };

    const handleImportComplete = (payload: ImportCompleteType) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.games.lists(),
      });
      setImportComplete(payload);
    };

    socket.on(SOCKET_EVENTS.IMPORT_PROGRESS, handleImportProgress);
    socket.on(SOCKET_EVENTS.IMPORT_COMPLETE, handleImportComplete);

    return () => {
      socket.off(SOCKET_EVENTS.IMPORT_PROGRESS, handleImportProgress);
      socket.off(SOCKET_EVENTS.IMPORT_COMPLETE, handleImportComplete);
      disconnectSocket()
    };
  }, []);

  return {
    importProgress,
    importComplete,
  };
};
