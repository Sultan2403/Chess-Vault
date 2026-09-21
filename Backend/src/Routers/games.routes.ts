import { Router } from "express";
import validate from "express-zod-safe";
import requireAuth from "../Middlewares/Auth/users.auth";
import {
  getGameController,
  importGamesController,
  searchGamesController,
  updateGameController,
  deleteGameController,
} from "../Controllers/games.controller";
import {
  gameParams,
  importGamesParams,
  searchGamesQuery,
  updateGameBody,
} from "../Schemas/games.schema";

const router = Router();

router.get(
  "/",
  validate({ query: searchGamesQuery }) as any,
  searchGamesController,
);

router.get(
  "/:id",
  validate({ params: gameParams }),
  getGameController,
);

router.patch(
  "/:id",
  validate({ params: gameParams, body: updateGameBody }),
  updateGameController,
);

router.delete(
  "/:id",
  validate({ params: gameParams }),
  deleteGameController,
);

router.post(
  "/import",
  validate({ body: importGamesParams }),
  importGamesController,
);

export default router;



