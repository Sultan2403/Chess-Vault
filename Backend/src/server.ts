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
    logger.info("HTTP server closed after uncaught exception");
    process.exit(1);
  });
});

const shutdown = (signal: string) => {
  logger.info({ signal }, "Shutting down server");

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));