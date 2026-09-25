export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  BAD_PAYLOAD: "bad_payload",
  JOIN_USER_ROOM: "join_user_room",
  IMPORT_PROGRESS: "import:progress",
  IMPORT_COMPLETE: "import:complete",
  IMPORT_FAILED: "import:failed",
} as const;

export type SocketEventsType = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
