import { Request, Response } from "express";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { env } from "../Config/env";
import Accounts from "../DB/Models/accounts.model";
import { CLERK_WEBHOOK_EVENTS } from "../Config/constants";

export const handleClerkWebhook = async (req: Request, res: Response) => {
  const secret = env.CLERK_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: "Missing secret" });

  try {
    // Pass req.headers directly. It throws automatically if headers are missing or invalid.
    const wh = new Webhook(secret);
    const evt = wh.verify(
      req.body,
      req.headers as unknown as WebhookRequiredHeaders,
    ) as any;

    if (evt.type === CLERK_WEBHOOK_EVENTS.USER_CREATED) {
      await Accounts.create({ userId: evt.data.id });
      console.log(`✅ Game Bank initialized for ${evt.data.id}`);
    } else if (evt.type === CLERK_WEBHOOK_EVENTS.USER_DELETED) {
      await Accounts.deleteOne({ userId: evt.data.id });

      //   Add background jobs to empty all user data. Or do it here directly

      //   Background job would be preffered due to natural volume and time
      console.log(`🗑️ Account removed for ${evt.data.id}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res
      .status(400)
      .json({ error: "Invalid webhook payload or signature" });
  }
};
