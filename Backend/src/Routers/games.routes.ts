import { Router } from "express";
import { importGamesController } from "../Controllers/games.controller";

const router = Router();

router.post("/import", importGamesController);

export default router;
