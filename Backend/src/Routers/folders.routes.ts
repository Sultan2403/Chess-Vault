import { Router } from "express";
import requireAuth from "../Middlewares/Auth/users.auth";
import {
  createFolderController,
  deleteFolderController,
  getFolderController,
  listFoldersController,
  updateFolderController,
} from "../Controllers/folders.controller";

const router = Router();

router.get("/", listFoldersController);
router.post("/", createFolderController);
router.get("/:id", getFolderController);
router.patch("/:id", updateFolderController);
router.delete("/:id", deleteFolderController);

export default router;
