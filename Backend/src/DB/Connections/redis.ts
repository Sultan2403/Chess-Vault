import Redis from "ioredis";
import env, { isProd } from "../../Config/env";
import { logger } from "../../Config/logger";

const redisClient = isProd
  ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: env.REDIS_URL,
      port: env.REDIS_PORT,
      maxRetriesPerRequest: null, // Required by BullMQ
    });

redisClient.on("connect", () => {
  logger.info("Redis connection successful");
});

redisClient.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

export default redisClient;
