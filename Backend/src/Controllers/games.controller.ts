import { Request, Response } from "express";
import { getAuth } from "@clerk/express";

export const saveGameController = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { folderId, platform } = req.params;





  res.status(200).json({ success: true, message: "Games imported successfully" });
};

