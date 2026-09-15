import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import {
  verifyLinkedAccount,
  connectLinkedAccounts,
  getAccountBootstrap,
} from "../../src/Services/accounts.service";
import chessComApi from "../../src/Api/chess_com.api";
import lichessApi from "../../src/Api/lichess.api";
import Accounts from "../../src/DB/Models/accounts.model";
import LinkedAccounts from "../../src/DB/Models/linked_accounts.model";

// Helper to create realistic Axios errors
const createAxiosError = (status: number, message: string) => {
  const error = new AxiosError(message);
  error.response = {
    status,
    statusText: message,
    data: {},
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
};

describe("Accounts Service Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("verifyLinkedAccount", () => {
    it("should successfully verify an existing Chess.com account", async () => {
      vi.spyOn(chessComApi, "getPlayerProfile").mockResolvedValue({
        username: "Sultan2403",
      } as any);

      const result = await verifyLinkedAccount("chess.com", "Sultan2403");

      expect(result).toEqual({
        success: true,
        username: "Sultan2403",
      });
    });

    it("should successfully verify an existing Lichess account", async () => {
      vi.spyOn(lichessApi, "getUserProfile").mockResolvedValue({
        id: "sultan2403",
        username: "Sultan2403",
      });

      const result = await verifyLinkedAccount("lichess", "Sultan2403");

      expect(result).toEqual({
        success: true,
        username: "Sultan2403",
      });
    });

    it("should handle HTTP 404 when the account does not exist", async () => {
      const notFoundError = createAxiosError(404, "Not Found");
      vi.spyOn(chessComApi, "getPlayerProfile").mockRejectedValue(notFoundError);

      const result = await verifyLinkedAccount("chess.com", "non_existent_user_999");

      expect(result).toEqual({
        success: false,
        username: "non_existent_user_999",
        message: "No chess.com account was found with that username.",
      });
    });

    it("should handle HTTP 429 when platform rate limit is reached", async () => {
      const rateLimitError = createAxiosError(429, "Too Many Requests");
      vi.spyOn(lichessApi, "getUserProfile").mockRejectedValue(rateLimitError);

      const result = await verifyLinkedAccount("lichess", "sultan2403");

      expect(result).toEqual({
        success: false,
        username: "sultan2403",
        message: "lichess is busy right now. Please try again shortly.",
      });
    });

    it("should handle unexpected network or server errors", async () => {
      vi.spyOn(chessComApi, "getPlayerProfile").mockRejectedValue(
        new Error("Network connection dropped"),
      );

      const result = await verifyLinkedAccount("chess.com", "sultan2403");

      expect(result).toEqual({
        success: false,
        username: "sultan2403",
        message: "We couldn't verify that chess.com account right now.",
      });
    });
  });

  describe("connectLinkedAccounts", () => {
    it("should connect valid accounts and reject invalid ones in the same batch", async () => {
      // Mock Chess.com success, Lichess 404
      vi.spyOn(chessComApi, "getPlayerProfile").mockResolvedValue({
        username: "Sultan2403",
      } as any);
      vi.spyOn(lichessApi, "getUserProfile").mockRejectedValue(
        createAxiosError(404, "Not Found"),
      );

      // Mock DB methods
      vi.spyOn(LinkedAccounts, "findOneAndUpdate").mockReturnValue({
        lean: vi.fn().mockResolvedValue({}),
      } as any);

      vi.spyOn(LinkedAccounts, "find").mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: "65f1a2b3c4d5e6f7a8b9c0d1",
              userId: "user_123",
              platform: "chess.com",
              username: "Sultan2403",
              normalizedUsername: "sultan2403",
            },
          ]),
        }),
      } as any);

      const response = await connectLinkedAccounts("user_123", {
        accounts: [
          { platform: "chess.com", username: "Sultan2403" },
          { platform: "lichess", username: "invalid_lichess_user" },
        ],
      });

      expect(response.success).toBe(true);
      expect(response.results).toHaveLength(2);
      expect(response.results[0]).toEqual({
        platform: "chess.com",
        username: "Sultan2403",
        success: true,
        message: "Connected Sultan2403.",
      });
      expect(response.results[1]).toEqual({
        platform: "lichess",
        username: "invalid_lichess_user",
        success: false,
        message: "No lichess account was found with that username.",
      });
      expect(response.linkedAccounts).toHaveLength(1);
    });
  });

  describe("getAccountBootstrap", () => {
    it("should return needsOnboarding: true when the user has 0 linked accounts", async () => {
      vi.spyOn(Accounts, "findOneAndUpdate").mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: "65f1a2b3c4d5e6f7a8b9c0aa",
          userId: "user_123",
        }),
      } as any);

      vi.spyOn(LinkedAccounts, "find").mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const bootstrap = await getAccountBootstrap("user_123");

      expect(bootstrap.needsOnboarding).toBe(true);
      expect(bootstrap.linkedAccounts).toEqual([]);
      expect(bootstrap.account.id).toBe("65f1a2b3c4d5e6f7a8b9c0aa");
    });

    it("should return needsOnboarding: false when the user has at least 1 linked account", async () => {
      vi.spyOn(Accounts, "findOneAndUpdate").mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: "65f1a2b3c4d5e6f7a8b9c0aa",
          userId: "user_123",
        }),
      } as any);

      vi.spyOn(LinkedAccounts, "find").mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: "65f1a2b3c4d5e6f7a8b9c0d1",
              userId: "user_123",
              platform: "chess.com",
              username: "Sultan2403",
            },
          ]),
        }),
      } as any);

      const bootstrap = await getAccountBootstrap("user_123");

      expect(bootstrap.needsOnboarding).toBe(false);
      expect(bootstrap.linkedAccounts).toHaveLength(1);
    });
  });
});
