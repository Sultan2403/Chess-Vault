import { Request, Response } from "express";
import {
  searchGames,
  getGameById,
  updateGame,
  deleteGame,
  bulkAddFolderIds,
  bulkDeleteGames,
} from "../Services/games.service";
import {
  ImportGamesParams,
  UpdateGameInput,
  BulkAddFolderIdsInput,
  BulkDeleteGamesInput,
} from "../Types/games.types";
import { getUserId } from "../Utils";
import {
  successResponse,
  notFoundResponse,
  internalError,
} from "../Utils";

export const searchGamesController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;

  try {
    const result = await searchGames({
      userId,
      ...(req.query as any),
    });
    return successResponse({ res, data: result });
  } catch (error: any) {
    return internalError({ res, error, message: "Failed to search games" });
  }
};

export const getGameController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);

  try {
    const game = await getGameById(id, userId);
    if (!game) {
      return notFoundResponse({ res, message: "Game not found" });
    }
    return successResponse({ res, data: { game } });
  } catch (error) {
    return internalError({ res, error, message: "Failed to retrieve game" });
  }
};

export const updateGameController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);
  const updateData: UpdateGameInput = req.body;

  try {
    const game = await updateGame(id, userId, updateData);
    if (!game) {
      return notFoundResponse({ res, message: "Game not found" });
    }
    return successResponse({
      res,
      message: "Game updated successfully",
      data: { game },
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to update game" });
  }
};

export const deleteGameController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);

  try {
    const deleted = await deleteGame(id, userId);
    if (!deleted) {
      return notFoundResponse({ res, message: "Game not found" });
    }
    return successResponse({ res, message: "Game deleted successfully" });
  } catch (error) {
    return internalError({ res, error, message: "Failed to delete game" });
  }
};

export const bulkAddFolderIdsController = async (
  req: Request,
  res: Response,
) => {
  const userId = getUserId(req)!;
  const { gameIds, folderIds }: BulkAddFolderIdsInput = req.body;

  try {
    const modifiedCount = await bulkAddFolderIds(userId, gameIds, folderIds);
    return successResponse({
      res,
      message: `Successfully added ${modifiedCount} games to collections`,
      data: { modifiedCount },
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to add games to collections" });
  }
};

export const bulkDeleteGamesController = async (
  req: Request,
  res: Response,
) => {
  const userId = getUserId(req)!;
  const { gameIds }: BulkDeleteGamesInput = req.body;

  try {
    const deletedCount = await bulkDeleteGames(userId, gameIds);
    return successResponse({
      res,
      message: `Successfully deleted ${deletedCount} games`,
      data: { deletedCount },
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to delete games" });
  }
};
