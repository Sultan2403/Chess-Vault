import { getAuth } from "@clerk/express";
import { Request } from "express";

export const getUserId = (req: Request): string => {
  const userId = getAuth(req).userId;
  return userId!;
};
