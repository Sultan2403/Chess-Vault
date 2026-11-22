import { Request, Response } from "express";
import { getUserId, successResponse, internalError } from "../Utils";
import { getAnalyticsData } from "../Services/analytics.service";
import { AnalyticsQuery } from "@chess-vault/shared";

export const getAnalyticsController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const query = req.query as unknown as AnalyticsQuery;

  try {
    const data = await getAnalyticsData(userId, query);
    return successResponse({
      res,
      message: "Analytics data fetched successfully",
      data,
    });
  } catch (error) {
    return internalError({
      res,
      error,
      message: "Failed to fetch analytics data",
    });
  }
};
