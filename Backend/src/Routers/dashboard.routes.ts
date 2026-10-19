import { Router } from "express";
import validate from "express-zod-safe";
import { dashboardQuerySchema } from "@chess-vault/shared";
import { getDashboardController } from "../Controllers/dashboard.controller";

const router = Router();

router.get(
  "/",
  validate({ query: dashboardQuerySchema }),
  getDashboardController,
);

export default router;
