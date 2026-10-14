import "./instrument";
import * as Sentry from "@sentry/node";
import app from "./app";
import env from "./Config/env";
import http from "http";
import { logger } from "./Config/logger";
import connectDB from "./DB/Connections/mongo";
import { initSocket } from "./Sockets/socket";
import { importWorker } from "./Jobs/import.worker"; // registers BullMQ workers on boot
import { purgeWorker } from "./Jobs/purge.worker";

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
    logger.info("HTTP server closed after uncaught exception");
    process.exit(1);
  });
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutting down server");

  await Promise.all([importWorker.close(), purgeWorker.close()]);
  logger.info("BullMQ workers closed");

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
