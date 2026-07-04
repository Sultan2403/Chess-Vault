import app from "./app";
import http from "http";
import { env } from "./Config/env";
import { initSocket } from "./Sockets/socket";
import connectDB from "./DB/Connections/mongo";

connectDB();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
