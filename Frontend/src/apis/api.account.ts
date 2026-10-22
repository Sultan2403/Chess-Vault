import type {
  AccountBootstrap,
  ConnectLinkedAccountsInput,
  ConnectLinkedAccountsResult,
  PlatformType,
  VerifyLinkedAccountResult,
  AccountsStatsPreviewResult,
} from "@chess-vault/shared";
import api from "./api.client";

export type AccountBootstrapResponse = { success: boolean } & AccountBootstrap;

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
  ): Promise<AccountsStatsPreviewResult> =>
    api.post("/account/linked-accounts/stats-preview", data),
};

export default accountApi;

