import type {
  AccountBootstrap,
  AccountsStatsPreviewResult,
  ConnectLinkedAccountsInput,
  ConnectLinkedAccountsResult,
  Account,
  PlatformType,
  VerifyLinkedAccountResult,
} from "@chess-vault/shared";
import api from "./api.client";

export type AccountBootstrapResponse = { success: boolean } & AccountBootstrap;

export type StatsPreviewResponse = { success: boolean; message: string } & AccountsStatsPreviewResult;

const accountApi = {
  getBootstrap: (): Promise<AccountBootstrapResponse> =>
    api.get("/account/bootstrap"),

  connectLinkedAccounts: (
    data: ConnectLinkedAccountsInput,
  ): Promise<ConnectLinkedAccountsResult> =>
    api.post("/account/linked-accounts/connect", data),

  verifyLinkedAccount: (data: {
    platform: PlatformType;
    username: string;
  }): Promise<VerifyLinkedAccountResult> =>
    api.post("/account/linked-accounts/verify", data),

  getStatsPreview: (
    data: ConnectLinkedAccountsInput,
  ): Promise<StatsPreviewResponse> =>
    api.post("/account/linked-accounts/stats-preview", data),

  completeOnboarding: (): Promise<{ success: boolean; message: string; account: Account }> =>
    api.post("/account/onboarding/complete"),
};

export default accountApi;
