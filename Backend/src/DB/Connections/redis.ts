import Redis from "ioredis";
import env from "../../Config/env";
import { logger } from "../../Config/logger";

const redisClient = new Redis({
  host: env.REDIS_URL,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redisClient.on("connect", () => {
  logger.info("Redis connection successful");
});

redisClient.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

export default redisClient;
