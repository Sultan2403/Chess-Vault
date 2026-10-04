export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  IMPORT_PROGRESS: "import:progress",
  IMPORT_COMPLETE: "import:complete",
  IMPORT_FAILED: "import:failed",
} as const;

export type SocketEventsType = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
