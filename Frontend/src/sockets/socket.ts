import { io } from "socket.io-client";
import env from "../config/env";
import { getToken } from "@clerk/react";

const socket = io(env.VITE_API_URL, {
  auth: async (cb) => {
    const token = await getToken();
    cb({ token });
  },
});

export default socket;
