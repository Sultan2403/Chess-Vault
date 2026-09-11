import pino from "pino";
import env, { isProd } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL || (isProd ? "info" : "debug"),
  transport: !isProd
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
