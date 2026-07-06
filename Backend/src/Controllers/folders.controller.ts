import { Request, Response } from "express";
import {
  createFolder,
  deleteFolder,
  getFolderById,
  getUserFolders,
  updateFolder,
} from "../Services/folders.service";
import { getUserId } from "../Utils/auth";
import { parsePositiveInt } from "../Utils";
import { internalError } from "../Utils/responses";

export const listFoldersController = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 20);

  try {
    const pagination = await getUserFolders(userId, page, limit);
    return res.status(200).json({ success: true, ...pagination });
  } catch (error) {
    return internalError(res, error);
  }
};

export const createFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { name, description } = req.body;

  try {
    const folder = await createFolder({ name, description, userId });
    return res.status(201).json({ success: true, folder });
  } catch (error) {
    return internalError(res, error);
  }
};

export const getFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const id = String(req.params.id);

  try {
    const folder = await getFolderById(id, userId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    return res.status(200).json({ success: true, folder });
  } catch (error) {
    return internalError(res, error);
  }
};

export const updateFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const id = String(req.params.id);
  const { name, description } = req.body;

  try {
    const folder = await updateFolder(id, userId, { name, description });
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    return res.status(200).json({ success: true, folder });
  } catch (error) {
    return internalError(res, error);
  }
};

export const deleteFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const id = String(req.params.id);

  try {
    const deleted = await deleteFolder(id, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Folder not found" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return internalError(res, error);
  }
};
