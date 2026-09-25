import "./instrument";
import * as Sentry from "@sentry/node";
import app from "./app";
import env from "./Config/env";
import http from "http";
import { logger } from "./Config/logger";
import connectDB from "./DB/Connections/mongo";
import { initSocket } from "./Config/socket";
import "./Jobs/import.worker"; // Side-effect: registers BullMQ worker on boot

connectDB();

const PORT = env.PORT;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled Promise Rejection");
  Sentry.captureException(reason);
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception - shutting down");
  Sentry.captureException(error);
  server.close(() => {
    process.exit(1);
  });
});
