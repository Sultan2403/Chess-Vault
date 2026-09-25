import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import env, { isProd } from "./Config/env";
import { logger } from "./Config/logger";

if (isProd) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE ?? 1.0,
    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.mongoIntegration(),
    ],
  });
  logger.info({ environment: env.NODE_ENV }, "Sentry instrumentation initialized");
}