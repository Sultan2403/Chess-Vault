export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  BAD_PAYLOAD: "bad_payload",
} as const;

export type SocketEventsType = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
