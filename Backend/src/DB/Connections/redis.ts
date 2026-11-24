import Redis from "ioredis";
import * as Sentry from "@sentry/node";
import env, { isProd } from "../../Config/env";
import { logger } from "../../Config/logger";

export const BullMQRedis = isProd
  ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: env.REDIS_URL,
      port: env.REDIS_PORT,
      maxRetriesPerRequest: null, // Required by BullMQ
    });

// Cache client: fast-fail when Redis is offline so API requests never hang.
// enableOfflineQueue: false — commands are rejected immediately if the connection
// is not ready, letting the try/catch in services fall through to the DB.
export const redis = isProd
  ? new Redis(env.REDIS_URL, {
      enableOfflineQueue: false,
      connectTimeout: 1500,
      maxRetriesPerRequest: 1,
    })
  : new Redis({
      host: env.REDIS_URL,
      port: env.REDIS_PORT,
      enableOfflineQueue: false,
      connectTimeout: 1500,
      maxRetriesPerRequest: 1,
    });

BullMQRedis.on("connect", () => {
  logger.info("BullMQ Redis client connection successful");
});

BullMQRedis.on("error", (err) => {
  logger.error({ err }, "BullMQ Redis client error");
});

redis.on("connect", () => {
  logger.info("Redis cache client connection successful");
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis cache client error");
  if (isProd) {
    Sentry.captureException(err, { tags: { layer: "redis-cache" } });
  }
});

