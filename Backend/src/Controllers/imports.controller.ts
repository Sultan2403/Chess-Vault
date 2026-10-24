import { Request, Response } from "express";
import { getUserId, successResponse, internalError, badRequestResponse } from "../Utils";
import { importService } from "../Services/import.service";
import Imports from "../DB/Models/imports.model";

export const startImportController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const { linkedAccountId } = req.body;

  if (!linkedAccountId) {
    return badRequestResponse({
      res,
      message: "linkedAccountId is required",
    });
  }

  try {
    const importDoc = await importService.startImport({
      userId,
      linkedAccountId,
      trigger: "manual",
    });

    return successResponse({
      res,
      statusCode: 202,
      message: "Import queued successfully",
      data: importDoc,
    });
  } catch (error: any) {
    return internalError({
      res,
      error,
      message: error.message || "Failed to start import",
    });
  }
};

export const getImportHistoryController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;

  try {
    const history = await Imports.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return successResponse({
      res,
      message: "Import history retrieved successfully",
      data: history,
    });
  } catch (error: any) {
    return internalError({
      res,
      error,
      message: "Failed to fetch import history",
    });
  }
};
