import type {
  AccountBootstrap,
  ConnectLinkedAccountsInput,
  ConnectLinkedAccountsResult,
  ImportResult,
  PlatformType,
  VerifyLinkedAccountResult,
} from "@chess-vault/shared";
import api from "./api.client";

export type AccountBootstrapResponse = { success: boolean } & AccountBootstrap;

const accountApi = {
  getBootstrap: (): Promise<AccountBootstrapResponse> =>
    api.get("/api/account/bootstrap"),

  connectLinkedAccounts: (
    data: ConnectLinkedAccountsInput,
  ): Promise<ConnectLinkedAccountsResult> =>
    api.post("/api/account/linked-accounts/connect", data),

  verifyLinkedAccount: (data: {
    platform: PlatformType;
    username: string;
  }): Promise<VerifyLinkedAccountResult> =>
    api.post("/api/account/linked-accounts/verify", data),

  syncLinkedAccount: (id: string): Promise<ImportResult> =>
    api.post(`/api/account/linked-accounts/${id}/sync`),
};

export default accountApi;
