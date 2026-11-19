import { Router } from "express";
import validate from "express-zod-safe";
import {
  createFolderController,
  deleteFolderController,
  getFolderController,
  getFolderGamesController,
  getFolderSummaryController,
  listFoldersController,
  updateFolderController,
} from "../Controllers/folders.controller";
import {
  createFolderBody,
  updateFolderBody,
  folderParams,
  listFoldersQuery,
  listFolderGamesQuery,
} from "../Schemas/folder.schema";

const router = Router();

router.get("/", validate({ query: listFoldersQuery }) as any, listFoldersController);
router.post("/", validate({ body: createFolderBody }), createFolderController);
router.get("/:id", validate({ params: folderParams }), getFolderController);
router.get(
  "/:id/summary",
  validate({ params: folderParams }),
  getFolderSummaryController,
);
router.get(
  "/:id/games",
  validate({ params: folderParams, query: listFolderGamesQuery }) as any,
  getFolderGamesController,
);
router.patch(
  "/:id",
  validate({ params: folderParams, body: updateFolderBody }),
  updateFolderController,
);
router.delete(
  "/:id",
  validate({ params: folderParams }),
  deleteFolderController,
);

export default router;
