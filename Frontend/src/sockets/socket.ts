import { io } from "socket.io-client";
import env from "../config/env";
import { getToken } from "@clerk/react";

const getSocketUrl = () => {
  const url = env.VITE_API_URL;
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url.replace(/\/api\/?$/, "");
  }
};

const socket = io(getSocketUrl(), {
  autoConnect: true,
  auth: async (cb) => {
    try {
      const token = await getToken();
      cb({ token });
    } catch {
      cb({ token: null });
    }
  },
})

export default socket;
