import { Router } from "express";
import validate from "express-zod-safe";
import { startImportBody } from "@chess-vault/shared";
import {
  startImportController,
  getImportHistoryController,
} from "../Controllers/imports.controller";

const router = Router();

router.post("/start", validate({ body: startImportBody }), startImportController);
router.get("/history", getImportHistoryController);

export default router;
