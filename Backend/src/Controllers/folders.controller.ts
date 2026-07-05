import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  createFolder,
  deleteFolder,
  getFolderById,
  getUserFolders,
  updateFolder,
} from "../Services/folders.service";

const getUserId = (req: Request) => getAuth(req).userId;

const unauthorizedResponse = (res: Response) =>
  res.status(401).json({ error: "Unauthorized" });

const internalError = (res: Response, error: unknown) => {
  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
};

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

export const listFoldersController = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return unauthorizedResponse(res);

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
  if (!userId) return unauthorizedResponse(res);

  const { name, description } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Folder name is required" });
  }

  try {
    const folder = await createFolder({ name, description, userId });
    return res.status(201).json({ success: true, folder });
  } catch (error) {
    return internalError(res, error);
  }
};

export const getFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return unauthorizedResponse(res);

  const { id } = req.params;
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
  if (!userId) return unauthorizedResponse(res);

  const { id } = req.params;
  const { name, description } = req.body;
  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ error: "Folder name must be a string" });
  }
  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ error: "Folder description must be a string" });
  }

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
  if (!userId) return unauthorizedResponse(res);

  const { id } = req.params;
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
