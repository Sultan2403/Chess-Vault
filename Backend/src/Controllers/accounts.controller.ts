import { Request, Response } from "express";
import { getUserId } from "../Utils";
import {
  successResponse,
  badRequestResponse,
  internalError,
} from "../Utils";
import {
  connectLinkedAccounts,
  getAccountBootstrap,
  verifyLinkedAccount,
  getAccountsStatsPreview,
  completeOnboarding,
  completeTutorial,
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

export const getAccountsStatsPreviewController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { accounts }: ConnectLinkedAccountsInput = req.body;
    const data = await getAccountsStatsPreview(accounts);
    return successResponse({
      res,
      message: "Player stats preview fetched successfully",
      data,
    });
  } catch (error) {
    return internalError({
      res,
      error,
      message: "Failed to load player stats preview",
    });
  }
};


export const completeOnboardingController = async (
  req: Request,
  res: Response,
) => {
  try {
    const account = await completeOnboarding(getUserId(req)!);
    return successResponse({
      res,
      message: "Onboarding completed successfully",
      data: { account },
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to complete onboarding" });
  }
};

export const completeTutorialController = async (
  req: Request,
  res: Response,
) => {
  try {
    const account = await completeTutorial(getUserId(req)!);
    return successResponse({
      res,
      message: "Tutorial completed successfully",
      data: { account },
    });
  } catch (error) {
    return internalError({ res, error, message: "Failed to complete tutorial" });
  }
};
