import { Router } from "express";
import validate from "express-zod-safe";
import { analyticsQuerySchema } from "@chess-vault/shared";
import { getAnalyticsController } from "../Controllers/analytics.controller";

const router = Router();

router.get(
  "/",
  validate({ query: analyticsQuerySchema }),
  getAnalyticsController,
);

export default router;
