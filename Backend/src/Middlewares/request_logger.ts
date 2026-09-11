import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import { logger } from "../Config/logger";
import { getUserId } from "../Utils/auth";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => (req.headers["x-request-id"] as string) || randomUUID(),
  customProps: (req) => {
    return {
      userId: getUserId(req as any) ?? undefined,
    };
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
