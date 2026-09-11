import { Request, Response } from "express";
import { Webhook, WebhookRequiredHeaders } from "svix";
import env from "../Config/env";
import Accounts from "../DB/Models/accounts.model";
import { CLERK_WEBHOOK_EVENTS } from "../Config/constants";
import { logger } from "../Config/logger";
import { successResponse, errorResponse } from "../Utils/responses";

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
      // deleteOne is inherently idempotent (deleting non-existent record is a no-op)
      await Accounts.deleteOne({ userId });

      // TODO: Dispatch background job to purge user data (e.g. BullMQ / RabbitMQ)
      logger.info({ userId }, "Account removed for user");
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
