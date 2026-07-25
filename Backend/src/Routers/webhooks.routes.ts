import { Router, raw } from "express";
import { handleClerkWebhook } from "../Controllers/webhooks.controller";

const router = Router();

// Process raw JSON buffer strictly for Clerk signature verification
router.post("/clerk", raw({ type: "application/json" }), handleClerkWebhook);

export default router;
