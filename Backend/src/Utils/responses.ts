import { Response } from "express";

export const internalError = (res: Response, error: unknown) => {
  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
};
