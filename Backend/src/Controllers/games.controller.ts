import { Request, Response } from "express";
import { importGames } from "../Services/games.service";
import { ImportGamesParams } from "../Types/games.types";
import { getUserId } from "../Utils/auth";

export const importGamesController = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { folderId, platform, username }: ImportGamesParams = req.body;

  const result = await importGames({ platform, folderId, username, userId });
  if (result.success) {
    return res.status(200).json({ success: true, message: result.message });
  }

  res.status(500).json({
    success: false,
    message: result.message || "Something went wrong",
  });
};
