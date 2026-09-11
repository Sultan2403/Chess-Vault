import app from "./app";
import env from "./Config/env";
import { logger } from "./Config/logger";
import connectDB from "./DB/Connections/mongo";

connectDB();

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled Promise Rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception - shutting down");
  server.close(() => {
    process.exit(1);
  });
});
