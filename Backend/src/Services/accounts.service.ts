import axios from "axios";
import type {
  Account,
  AccountBootstrap,
  ConnectLinkedAccountsInput,
  ConnectLinkedAccountsResult,
  LinkedAccount,
  LinkedAccountConnectionResult,
  PlatformType,
  VerifyLinkedAccountResult,
} from "@chess-vault/shared";
import { Platforms } from "@chess-vault/shared";
import chessComApi from "../Api/chess_com.api";
import lichessApi from "../Api/lichess.api";
import Accounts from "../DB/Models/accounts.model";
import LinkedAccounts from "../DB/Models/linked_accounts.model";
import { importGames } from "./games.service";

const toAccount = (account: any): Account => {
  const { _id, __v, ...rest } = account;
  return { id: _id.toString(), ...rest };
};

const toLinkedAccount = (account: any): LinkedAccount => {
  const { _id, __v, normalizedUsername, ...rest } = account;
  return { id: _id.toString(), ...rest };
};

const getAccount = async (userId: string) => {
  return Accounts.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
};

const getLinkedAccounts = async (userId: string): Promise<LinkedAccount[]> => {
  const linkedAccounts = await LinkedAccounts.find({ userId })
    .sort({ createdAt: 1 })
    .lean();
  return linkedAccounts.map(toLinkedAccount);
};

export const getAccountBootstrap = async (
  userId: string,
): Promise<AccountBootstrap> => {
  const [account, linkedAccounts] = await Promise.all([
    getAccount(userId),
    getLinkedAccounts(userId),
  ]);

  return {
    account: toAccount(account),
    linkedAccounts,
    needsOnboarding: linkedAccounts.length === 0,
  };
};

export const verifyLinkedAccount = async (
  platform: PlatformType,
  username: string,
): Promise<VerifyLinkedAccountResult> => {
  try {
    if (platform === Platforms.CHESS_COM) {
      const profile = await chessComApi.getPlayerProfile(username);
      return { success: true, username: profile.username };
    }

    const profile = await lichessApi.getUserProfile(username);
    return { success: true, username: profile.username };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return {
          success: false,
          username,
          message: `No ${platform} account was found with that username.`,
        };
      }

      if (error.response?.status === 429) {
        return {
          success: false,
          username,
          message: `${platform} is busy right now. Please try again shortly.`,
        };
      }
    }

    return {
      success: false,
      username,
      message: `We couldn't verify that ${platform} account right now.`,
    };
  }
};

export const connectLinkedAccounts = async (
  userId: string,
  { accounts }: ConnectLinkedAccountsInput,
): Promise<ConnectLinkedAccountsResult> => {
  const results: LinkedAccountConnectionResult[] = [];

  for (const requestedAccount of accounts) {
    const verification = await verifyLinkedAccount(
      requestedAccount.platform,
      requestedAccount.username,
    );

    if (!verification.success) {
      results.push({
        platform: requestedAccount.platform,
        username: requestedAccount.username,
        success: false,
        message: verification.message,
      });
      continue;
    }

    const normalizedUsername = verification.username.toLowerCase();
    await LinkedAccounts.findOneAndUpdate(
      {
        userId,
        platform: requestedAccount.platform,
        normalizedUsername,
      },
      {
        $set: { username: verification.username },
        $setOnInsert: {
          userId,
          platform: requestedAccount.platform,
          normalizedUsername,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    results.push({
      platform: requestedAccount.platform,
      username: verification.username,
      success: true,
      message: `Connected ${verification.username}.`,
    });
  }

  const successfulConnections = results.filter((result) => result.success);
  const linkedAccounts = await getLinkedAccounts(userId);

  return {
    success: successfulConnections.length > 0,
    message:
      successfulConnections.length > 0
        ? "Your chess accounts have been connected."
        : "We couldn't connect any of those accounts.",
    results,
    linkedAccounts,
  };
};

export const syncLinkedAccount = async (id: string, userId: string) => {
  const linkedAccount = await LinkedAccounts.findOne({ _id: id, userId }).lean();
  if (!linkedAccount) return null;

  const result = await importGames({
    userId,
    platform: linkedAccount.platform as PlatformType,
    username: linkedAccount.username,
    folderIds: null,
  });

  if (result.success) {
    await LinkedAccounts.updateOne(
      { _id: linkedAccount._id, userId },
      { $set: { lastSyncedAt: new Date() } },
    );
  }

  return result;
};
