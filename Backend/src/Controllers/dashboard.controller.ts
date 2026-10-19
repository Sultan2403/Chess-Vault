import { Request, Response } from "express";
import { getUserId, successResponse, internalError } from "../Utils";
import { getDashboardData } from "../Services/dashboard.service";
import { DashboardQuery } from "@chess-vault/shared";

export const getDashboardController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const { platform } = req.query as unknown as DashboardQuery;

  try {
    const data = await getDashboardData(userId, platform);
    return successResponse({
      res,
      message: "Dashboard data fetched successfully",
      data,
    });
  } catch (error) {
    return internalError({
      res,
      error,
      message: "Failed to fetch dashboard data",
    });
  }
};
