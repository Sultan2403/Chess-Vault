import { Router } from "express";
import validate from "express-zod-safe";
import requireAuth from "../Middlewares/Auth/users.auth";
import {
  importGamesController,
  searchGamesController,
} from "../Controllers/games.controller";
import {
  importGamesParams,
  searchGamesQuery,
} from "../Schemas/games.schema";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  validate({ query: searchGamesQuery }) as any,
  searchGamesController,
);

router.post(
  "/import",
  validate({ body: importGamesParams }),
  importGamesController,
);

export default router;

