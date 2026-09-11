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
import {
  successResponse,
  errorResponse,
  internalError,
} from "../Utils/responses";

export const listFoldersController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;

  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 20);

  try {
    const pagination = await getUserFolders(userId, page, limit);
    return successResponse({ res, data: { ...pagination } });
  } catch (error) {
    return internalError({ res, error });
  }
};

export const createFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const { name, description } = req.body;

  try {
    const folder = await createFolder({ name, description, userId });
    return successResponse({ res, statusCode: 201, data: { folder } });
  } catch (error) {
    return internalError({ res, error });
  }
};

export const getFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);

  try {
    const folder = await getFolderById(id, userId);
    if (!folder) {
      return errorResponse({
        res,
        statusCode: 404,
        message: "Folder not found",
      });
    }
    return successResponse({ res, data: { folder } });
  } catch (error) {
    return internalError({ res, error });
  }
};

export const updateFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);
  const { name, description } = req.body;

  try {
    const folder = await updateFolder(id, userId, { name, description });
    if (!folder) {
      return errorResponse({
        res,
        statusCode: 404,
        message: "Folder not found",
      });
    }
    return successResponse({ res, data: { folder } });
  } catch (error) {
    return internalError({ res, error });
  }
};

export const deleteFolderController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);

  try {
    const deleted = await deleteFolder(id, userId);
    if (!deleted) {
      return errorResponse({
        res,
        statusCode: 404,
        message: "Folder not found",
      });
    }
    return successResponse({ res });
  } catch (error) {
    return internalError({ res, error });
  }
};
