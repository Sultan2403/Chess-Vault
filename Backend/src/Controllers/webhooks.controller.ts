import { Request, Response } from "express";
import { Webhook, WebhookRequiredHeaders } from "svix";
import env from "../Config/env";
import Accounts from "../DB/Models/accounts.model";
import { CLERK_WEBHOOK_EVENTS } from "../Config/constants";

export const handleClerkWebhook = async (req: Request, res: Response) => {
  const secret = env.CLERK_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: "Missing secret" });

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
      console.log(`✅ Game Bank initialized for ${userId}`);
    } else if (evt.type === CLERK_WEBHOOK_EVENTS.USER_DELETED) {
      // deleteOne is inherently idempotent (deleting non-existent record is a no-op)
      await Accounts.deleteOne({ userId });

      // TODO: Dispatch background job to purge user data (e.g. BullMQ / RabbitMQ)
      console.log(`🗑️ Account removed for ${userId}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res
      .status(400)
      .json({ error: "Invalid webhook payload or signature" });
  }
};
