import { getAuth } from "@clerk/express";
import { Request } from "express";

export const getUserId = (req: Request): string | null => {
  return getAuth(req).userId;
};
