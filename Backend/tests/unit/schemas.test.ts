import { describe, it, expect } from "vitest";
import {
  searchGamesQuery,
  importGamesParams,
  gameParams,
  updateGameBody,
  GameSchema,
} from "@chess-vault/shared";
import {
  createFolderBody,
  folderParams,
  updateFolderBody,
} from "../../src/Schemas/folder.schema";

describe("Zod Validation Schemas", () => {
  describe("importGamesParams Schema", () => {
    it("should accept valid import payload with Chess.com platform", () => {
      const payload = {
        platform: "chess.com",
        username: "sultan2403",
        folderIds: ["65f1a2b3c4d5e6f7a8b9c0d1"],
      };

      const result = importGamesParams.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.platform).toBe("chess.com");
        expect(result.data.username).toBe("sultan2403");
      }
    });

    it("should reject an unsupported platform", () => {
      const payload = {
        platform: "unknown-platform",
        username: "sultan2403",
      };

      const result = importGamesParams.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should reject an invalid MongoDB ObjectId inside folderIds", () => {
      const payload = {
        platform: "lichess",
        username: "sultan2403",
        folderIds: ["not-a-valid-mongo-id"],
      };

      const result = importGamesParams.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("searchGamesQuery Schema", () => {
    it("should set default page to 1 and limit to 15", () => {
      const result = searchGamesQuery.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(15);
      }
    });

    it("should properly transform string booleans for isRated filter", () => {
      const resultTrue = searchGamesQuery.safeParse({ isRated: "true" });
      expect(resultTrue.success).toBe(true);
      if (resultTrue.success) {
        expect(resultTrue.data.isRated).toBe(true);
      }

      const resultFalse = searchGamesQuery.safeParse({ isRated: "false" });
      expect(resultFalse.success).toBe(true);
      if (resultFalse.success) {
        expect(resultFalse.data.isRated).toBe(false);
      }
    });

    it("should reject page numbers less than 1", () => {
      const result = searchGamesQuery.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });
  });

  describe("gameParams and updateGameBody Schemas", () => {
    it("should validate gameParams requiring a valid mongo id", () => {
      const valid = gameParams.safeParse({ id: "65f1a2b3c4d5e6f7a8b9c0d1" });
      expect(valid.success).toBe(true);

      const invalid = gameParams.safeParse({ id: "invalid-id" });
      expect(invalid.success).toBe(false);
    });

    it("should validate updateGameBody with valid fields", () => {
      const valid = updateGameBody.safeParse({
        title: "Magnus vs Hikaru Epic Blitz",
        notes: "Great game in the Sicilian Defense",
        tags: "blitz-tactics",
        folderIds: ["65f1a2b3c4d5e6f7a8b9c0d1"],
      });
      expect(valid.success).toBe(true);
    });

    it("should accept null folderIds to clear folder association", () => {
      const valid = updateGameBody.safeParse({
        folderIds: null,
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.folderIds).toBeNull();
      }
    });

    it("should reject updateGameBody with invalid folderIds", () => {
      const invalid = updateGameBody.safeParse({
        folderIds: ["not-mongo-id"],
      });
      expect(invalid.success).toBe(false);
    });

    it("should reject updateGameBody exceeding field lengths", () => {
      const invalidTag = updateGameBody.safeParse({
        tags: "a".repeat(21),
      });
      expect(invalidTag.success).toBe(false);

      const invalidTitle = updateGameBody.safeParse({
        title: "a".repeat(101),
      });
      expect(invalidTitle.success).toBe(false);

      const invalidNotes = updateGameBody.safeParse({
        notes: "a".repeat(1001),
      });
      expect(invalidNotes.success).toBe(false);
    });
  });

  describe("Folder Schemas", () => {
    it("should validate createFolderBody requiring name", () => {
      const valid = createFolderBody.safeParse({
        name: "My Best Games",
        description: "Games from 2026",
      });
      expect(valid.success).toBe(true);

      const emptyName = createFolderBody.safeParse({
        name: "   ",
      });
      expect(emptyName.success).toBe(false);
    });

    it("should validate folderParams requiring non-empty id", () => {
      const validId = folderParams.safeParse({ id: "65f1a2b3c4d5e6f7a8b9c0d1" });
      expect(validId.success).toBe(true);

      const emptyId = folderParams.safeParse({ id: "   " });
      expect(emptyId.success).toBe(false);
    });
  });
});

