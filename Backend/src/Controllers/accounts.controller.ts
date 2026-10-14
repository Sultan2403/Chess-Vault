import { Request, Response } from "express";
import { getUserId } from "../Utils";
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  internalError,
} from "../Utils";
import {
  connectLinkedAccounts,
  getAccountBootstrap,
  syncLinkedAccount,
  verifyLinkedAccount,
} from "../Services/accounts.service";
import type { ConnectLinkedAccountsInput } from "@chess-vault/shared";
import type { PlatformType } from "@chess-vault/shared";

export const getAccountBootstrapController = async (
  req: Request,
  res: Response,
) => {
  try {
    const bootstrap = await getAccountBootstrap(getUserId(req)!);
    return successResponse({ res, data: { ...bootstrap } });
  } catch (error) {
    return internalError({ res, error, message: "Failed to load account data" });
  }
};

export const connectLinkedAccountsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await connectLinkedAccounts(
      getUserId(req)!,
      req.body as ConnectLinkedAccountsInput,
    );
    const { success, message, ...data } = result;
    if (success) {
      return successResponse({
        res,
        message: message || "Accounts connected successfully",
        data,
      });
    }
    return badRequestResponse({
      res,
      message: message || "Failed to connect accounts",
      data,
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to connect accounts" });
  }
};

export const verifyLinkedAccountController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { platform, username } = req.body;
    const result = await verifyLinkedAccount(
      platform as PlatformType,
      username,
    );
    const { success, message, ...data } = result;
    if (success) {
      return successResponse({
        res,
        message: message || "Account verified successfully",
        data,
      });
    }
    return badRequestResponse({
      res,
      message: message || "Failed to verify account",
      data,
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to verify account" });
  }
};

export const syncLinkedAccountController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await syncLinkedAccount(
      String(req.params.id),
      getUserId(req)!,
    );
    if (!result) {
      return notFoundResponse({
        res,
        message: "Linked account not found",
      });
    }
    if (result.success) {
      return successResponse({ res, message: result.message });
    }
    return badRequestResponse({
      res,
      message: result.message || "Failed to sync account",
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to sync account" });
  }
};
