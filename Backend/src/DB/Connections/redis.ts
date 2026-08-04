import Redis from "ioredis";
import env from "../../Config/env";

const redisClient = new Redis({
  host: env.REDIS_URL,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redisClient.on("connect", () => {
  console.log("🟢 Redis connection successful");
});

redisClient.on("error", (err) => {
  console.error("🔴 Redis connection error", err);
});

export default redisClient;
