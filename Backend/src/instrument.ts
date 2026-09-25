import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import env from "./Config/env";
import { logger } from "./Config/logger";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE ?? (env.NODE_ENV === "production" ? 1.0 : 1.0),
    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.mongoIntegration(),
    ],
  });
  logger.info({ environment: env.NODE_ENV }, "Sentry instrumentation initialized");
} else {
  logger.debug("SENTRY_DSN not configured; running without Sentry");
}
