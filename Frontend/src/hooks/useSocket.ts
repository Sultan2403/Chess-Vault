import { useEffect, useState } from "react";
import socket from "../sockets/socket";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import type { ImportCompleteType, ImportProgressType } from "../types/socket";

export const useImportProgress = () => {
  const [importProgress, setImportProgress] =
    useState<ImportProgressType | null>(null);
  const [importComplete, setImportComplete] =
    useState<ImportCompleteType | null>(null);

  useEffect(() => {
    const handleImportProgress = (payload: ImportProgressType) => {
      setImportProgress(payload);
    };

    const handleImportComplete = (payload: ImportCompleteType) => {
      setImportComplete(payload);
    };

    socket.on(SOCKET_EVENTS.IMPORT_PROGRESS, handleImportProgress);
    socket.on(SOCKET_EVENTS.IMPORT_COMPLETE, handleImportComplete);

    return () => {
      socket.off(SOCKET_EVENTS.IMPORT_PROGRESS, handleImportProgress);
      socket.off(SOCKET_EVENTS.IMPORT_COMPLETE, handleImportComplete);
    };
  }, []);

  return {
    importProgress,
    importComplete,
  };
};
