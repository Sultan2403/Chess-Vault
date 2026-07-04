import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { saveNewGame } from "../Services/games.service";

export const saveGameController = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { url } = req.body;

  await saveNewGame(url, userId!);

  res.status(200).json({ success: true, message: "Game saved successfully" });
};

