import { Router } from "express";
import {
  startImportController,
  getImportHistoryController,
} from "../Controllers/imports.controller";

const router = Router();

router.post("/start", startImportController);
router.get("/history", getImportHistoryController);

export default router;
