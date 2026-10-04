import { io } from "socket.io-client";
import env from "../config/env";
import { getToken } from "@clerk/react";
import { SOCKET_EVENTS } from "@chess-vault/shared";

const socket = io(env.VITE_API_URL, {
  auth: async (cb) => {
    const token = await getToken();
    cb({ token });
  },
});

socket.emit(SOCKET_EVENTS.CONNECTION, ()=>{console.log("client connected to socket")})

export default socket;
