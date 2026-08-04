import { Router } from "express";
import gamesRouter from "./games.routes";
import foldersRouter from "./folders.routes";
import requireAuth from "../Middlewares/Auth/users.auth";

const router = Router();

router.use("/games", requireAuth, gamesRouter);
router.use("/folders", requireAuth, foldersRouter);

export default router;
