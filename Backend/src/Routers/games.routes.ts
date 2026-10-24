import { Router } from "express";
import validate from "express-zod-safe";
import {
  getGameController,
  searchGamesController,
  updateGameController,
  deleteGameController,
  bulkAddFolderIdsController,
  bulkDeleteGamesController,
} from "../Controllers/games.controller";
import {
  gameParams,
  importGamesParams,
  searchGamesQuery,
  updateGameBody,
  bulkAddFolderIdsSchema,
  bulkDeleteGamesSchema,
} from "../Schemas/games.schema";

const router = Router();

router.get(
  "/",
  validate({ query: searchGamesQuery }) as any,
  searchGamesController,
);

router.post(
  "/bulk/folders",
  validate({ body: bulkAddFolderIdsSchema }),
  bulkAddFolderIdsController,
);

router.post(
  "/bulk/delete",
  validate({ body: bulkDeleteGamesSchema }),
  bulkDeleteGamesController,
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

export default router;



