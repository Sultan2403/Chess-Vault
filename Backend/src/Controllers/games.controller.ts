import { Request, Response } from "express";
import {
  importGames,
  searchGames,
  getGameById,
} from "../Services/games.service";
import { ImportGamesParams } from "../Types/games.types";
import { getUserId } from "../Utils/auth";
import {
  successResponse,
  errorResponse,
  internalError,
} from "../Utils/responses";

export const importGamesController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const { folderIds, platform, username }: ImportGamesParams = req.body;

  const result = await importGames({ platform, folderIds, username, userId });
  if (result.success) {
    return successResponse({ res, message: result.message });
  }

  return errorResponse({
    res,
    statusCode: 500,
    message: result.message || "Something went wrong",
  });
};

export const searchGamesController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;

  try {
    const result = await searchGames({
      userId,
      ...(req.query as any),
    });
    return res.status(200).json(result);
  } catch (error: any) {
    return internalError({ res, error, message: error?.message });
  }
};

export const getGameController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const id = String(req.params.id);

  try {
    const game = await getGameById(id, userId);
    if (!game) {
      return errorResponse({
        res,
        statusCode: 404,
        message: "Game not found",
      });
    }
    return successResponse({ res, data: { game } });
  } catch (error) {
    return internalError({ res, error });
  }
};
