import { Request, Response } from "express";
import { getUserId, successResponse, internalError, notFoundResponse } from "../Utils";
import { importService } from "../Services/import.service";
import Imports from "../DB/Models/imports.model";
import LinkedAccounts from "../DB/Models/linked_accounts.model";
import { StartImportInput } from "@chess-vault/shared";

export const startImportController = async (req: Request, res: Response) => {
  const userId = getUserId(req)!;
  const { linkedAccountId, trigger }: StartImportInput = req.body;

  try {
    const linkedAccount = await LinkedAccounts.findOne({
      _id: linkedAccountId,
      userId,
    });

    if (!linkedAccount) {
      return notFoundResponse({
        res,
        message: "Linked account not found",
      });
    }

    // Determine trigger: explicit parameter takes priority; otherwise derive
    const resolvedTrigger =
      trigger || (linkedAccount.lastSyncedAt ? "manual" : "onboarding");

    const importDoc = await importService.startImport({
      userId,
      linkedAccountId,
      trigger: resolvedTrigger,
    });

    return successResponse({
      res,
      statusCode: 202,
      message: "Import queued successfully",
      data: { import: importDoc.toJSON() },
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
      data: { history },
    });
  } catch (error: any) {
    return internalError({
      res,
      error,
      message: "Failed to fetch import history",
    });
  }
};
