import { Request, Response } from "express";
import { Webhook, WebhookRequiredHeaders } from "svix";
import env from "../Config/env";
import { CLERK_WEBHOOK_EVENTS, JOB_NAMES } from "../Config/constants";
import { logger } from "../Config/logger";
import { successResponse, errorResponse } from "../Utils";
import { purgeUserQueue } from "../Jobs/purge.queue";
import Accounts from "../DB/Models/accounts.model";

export const handleClerkWebhook = async (req: Request, res: Response) => {
  const secret = env.CLERK_WEBHOOK_SECRET;

  try {
    const wh = new Webhook(secret);
    const evt = wh.verify(
      req.body,
      req.headers as unknown as WebhookRequiredHeaders,
    ) as any;

    const userId = evt.data.id;

    if (evt.type === CLERK_WEBHOOK_EVENTS.USER_CREATED) {
      // Upsert ensures we don't throw duplicate key errors if the event triggers twice
      await Accounts.updateOne(
        { userId },
        { $setOnInsert: { userId } },
        { upsert: true },
      );
      logger.info({ userId }, "Game Bank initialized for user");
    } else if (evt.type === CLERK_WEBHOOK_EVENTS.USER_DELETED) {
      // Finalize if user data should be purged asap or after a grace period and so on. Right now, user data is purged asap and it should probably remain like that.
      await purgeUserQueue.add(
        JOB_NAMES.PURGE_USER,
        { userId },
        {
          jobId: `purge_user_${userId}`,
          attempts: 5,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: { count: 100 },
        },
      );
      logger.info({ userId }, "User data purge queued");
    }

    return successResponse({ res });
  } catch (err) {
    logger.error({ err }, "Webhook verification/processing error");
    return errorResponse({
      res,
      statusCode: 400,
      message: "Invalid webhook payload or signature",
    });
  }
};
