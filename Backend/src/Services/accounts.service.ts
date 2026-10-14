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
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
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
  const [account, existingLinkedAccounts] = await Promise.all([
    getAccount(userId),
    getLinkedAccounts(userId),
  ]);

  const limit = account.plan.linkedAccountLimit;
  let availableSlots = Math.max(0, limit - existingLinkedAccounts.length);

  const existingKeys = new Set(
    existingLinkedAccounts.map(
      (a) => `${a.platform}:${a.username.toLowerCase()}`,
    ),
  );

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
    const accountKey = `${requestedAccount.platform}:${normalizedUsername}`;

    if (existingKeys.has(accountKey)) {
      results.push({
        platform: requestedAccount.platform,
        username: verification.username,
        success: false,
        message: `This ${requestedAccount.platform} account is already linked.`,
      });
      continue;
    }

    if (availableSlots <= 0) {
      results.push({
        platform: requestedAccount.platform,
        username: verification.username,
        success: false,
        message: `You have reached your limit of ${limit} linked account${limit !== 1 ? "s" : ""}.`,
      });
      continue;
    }

    await LinkedAccounts.create({
      userId,
      platform: requestedAccount.platform,
      username: verification.username,
      normalizedUsername,
    });

    availableSlots--;
    existingKeys.add(accountKey);

    results.push({
      platform: requestedAccount.platform,
      username: verification.username,
      success: true,
      message: `Connected ${verification.username}.`,
    });
  }

  const successfulConnections = results.filter((result) => result.success);
  const updatedLinkedAccounts = await getLinkedAccounts(userId);

  return {
    success: successfulConnections.length > 0,
    message:
      successfulConnections.length > 0
        ? "Your chess accounts have been connected."
        : results.length === 1 && results[0]?.message
          ? results[0].message
          : "We couldn't connect any of those accounts.",
    results,
    linkedAccounts: updatedLinkedAccounts,
  };
};

