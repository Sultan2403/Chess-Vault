import { Router } from "express";
import validate from "express-zod-safe";
import { importGamesController } from "../Controllers/games.controller";
import { importGamesParams } from "../Schemas/games.schema";

const router = Router();

router.post(
  "/import/:folderId/:platform/:username",
  validate({ params: importGamesParams }) as any,
  importGamesController,
);

export default router;
