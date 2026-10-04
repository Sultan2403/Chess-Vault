import { Router } from "express";
import validate from "express-zod-safe";
import {
  createFolderController,
  deleteFolderController,
  getFolderController,
  listFoldersController,
  updateFolderController,
} from "../Controllers/folders.controller";
import {
  createFolderBody,
  updateFolderBody,
  folderParams,
  listFoldersQuery,
} from "../Schemas/folder.schema";

const router = Router();

router.get("/", validate({ query: listFoldersQuery }) as any, listFoldersController);
router.post("/", validate({ body: createFolderBody }), createFolderController);
router.get("/:id", validate({ params: folderParams }), getFolderController);
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
