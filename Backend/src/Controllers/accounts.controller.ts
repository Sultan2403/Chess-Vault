import { Request, Response } from "express";
import { getUserId } from "../Utils/auth";
import { internalError } from "../Utils/responses";
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
    const bootstrap = await getAccountBootstrap(getUserId(req));
    return res.status(200).json({ success: true, ...bootstrap });
  } catch (error) {
    return internalError({ res, error });
  }
};

export const connectLinkedAccountsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await connectLinkedAccounts(
      getUserId(req),
      req.body as ConnectLinkedAccountsInput,
    );
    return res.status(200).json(result);
  } catch (error) {
    return internalError({ res, error });
  }
};

export const verifyLinkedAccountController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { platform, username } = req.body;
    const result = await verifyLinkedAccount(platform as PlatformType, username);
    return res.status(200).json(result);
  } catch (error) {
    return internalError({ res, error });
  }
};

export const syncLinkedAccountController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await syncLinkedAccount(String(req.params.id), getUserId(req));
    if (!result) {
      return res.status(404).json({ success: false, message: "Linked account not found" });
    }
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    return internalError({ res, error });
  }
};
