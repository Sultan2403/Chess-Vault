import Redis from "ioredis";
import env, { isProd } from "../../Config/env";
import { logger } from "../../Config/logger";

export const { BullMQRedis } = isProd
  ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: env.REDIS_URL,
      port: env.REDIS_PORT,
      maxRetriesPerRequest: null, // Required by BullMQ
    });

export const redis = isProd
  ? new Redis(env.REDIS_URL)
  : new Redis({
      host: env.REDIS_URL,
      port: env.REDIS_PORT,
    });

{ BullMQRedis }.on("connect", () => {
  logger.info("BullMQ Redis client connection successful");
});

{ BullMQRedis }.on("error", (err) => {
  logger.error({ err }, "BullMQ Redis client error");
});

redis.on("connect", () => {
  logger.info("Redis client connection successful");
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis client error");
});

