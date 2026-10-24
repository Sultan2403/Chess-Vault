import { Router } from "express";
import gamesRouter from "./games.routes";
import foldersRouter from "./folders.routes";
import accountsRouter from "./accounts.routes";
import dashboardRouter from "./dashboard.routes";
import importsRouter from "./imports.routes";
import requireAuth from "../Middlewares/Auth/users.auth";

const router = Router();

router.use(requireAuth);

router.use("/dashboard", dashboardRouter);
router.use("/games", gamesRouter);
router.use("/folders", foldersRouter);
router.use("/account", accountsRouter);
router.use("/imports", importsRouter);

export default router;
