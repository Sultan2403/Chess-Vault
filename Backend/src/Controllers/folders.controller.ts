import { Request, Response } from "express";
import {
  createFolder,
  deleteFolder,
  getFolderById,
  getUserFolders,
  updateFolder,
} from "../Services/folders.service";
import { getUserId, parsePositiveInt } from "../Utils";
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  internalError,
} from "../Utils";

export const listFoldersController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;

  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 20);

  try {
    const pagination = await getUserFolders(userId, page, limit);
    return successResponse({ res, data: { ...pagination } });
  } catch (error) {
    return internalError({ res, error, message: "Failed to list folders" });
  }
};

export const createFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const { name, description } = req.body;

  try {
    const folder = await createFolder({ name, description, userId });
    return createdResponse({
      res,
      message: "Folder created successfully",
      data: { folder },
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to create folder" });
  }
};

export const getFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);

  try {
    const folder = await getFolderById(id, userId);
    if (!folder) {
      return notFoundResponse({ res, message: "Folder not found" });
    }
    return successResponse({ res, data: { folder } });
  } catch (error) {
    return internalError({ res, error, message: "Failed to retrieve folder" });
  }
};

export const updateFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);
  const { name, description } = req.body;

  try {
    const folder = await updateFolder(id, userId, { name, description });
    if (!folder) {
      return notFoundResponse({ res, message: "Folder not found" });
    }
    return successResponse({
      res,
      message: "Folder updated successfully",
      data: { folder },
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to update folder" });
  }
};

export const deleteFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);

  try {
    const deleted = await deleteFolder(id, userId);
    if (!deleted) {
      return notFoundResponse({ res, message: "Folder not found" });
    }
    return successResponse({ res, message: "Folder deleted successfully" });
  } catch (error) {
    return internalError({ res, error, message: "Failed to delete folder" });
  }
};
