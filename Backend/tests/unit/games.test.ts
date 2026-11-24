import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import Games from "../../src/DB/Models/games.model";
import Folders from "../../src/DB/Models/folders.model";
import {
  updateGame,
  deleteGame,
  bulkAddFolderIds,
} from "../../src/Services/games.service";

describe("Games Service Unit Tests (Update & Delete)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("updateGame", () => {
    it("should update game metadata (title, notes, tags, folderIds) and return normalized game", async () => {
      const mockGameId = "65f1a2b3c4d5e6f7a8b9c0d1";
      const mockUserId = "user_test_123";
      const mockFolderId = "65f1a2b3c4d5e6f7a8b9c0f9";

      const mockDbResult = {
        _id: new mongoose.Types.ObjectId(mockGameId),
        userId: mockUserId,
        userPlayedAs: "white",
        folderIds: [new mongoose.Types.ObjectId(mockFolderId)],
        platform: "chess.com",
        platformGameId: "123456",
        sourceUrl: "https://chess.com/game/123456",
        whitePlayer: { username: "Magnus", rating: 2850 },
        blackPlayer: { username: "Hikaru", rating: 2820 },
        result: "white",
        isRated: true,
        time: {
          timeClass: "blitz",
        },
        playedAt: new Date("2026-01-01T00:00:00Z"),
        pgn: "1. e4 e5",
        title: "Magnus vs Hikaru Blitz Final",
        notes: "Great game",
        tags: ["blitz"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(Folders, "countDocuments").mockResolvedValue(1);
      vi.spyOn(Games, "findOneAndUpdate").mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockDbResult),
      } as any);

      const result = await updateGame(mockGameId, mockUserId, {
        title: "Magnus vs Hikaru Blitz Final",
        notes: "Great game",
        tags: ["blitz"],
        folderIds: [mockFolderId],
      });

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockGameId);
      expect(result?.title).toBe("Magnus vs Hikaru Blitz Final");
      expect(result?.notes).toBe("Great game");
      expect(result?.tags).toEqual(["blitz"]);
      expect(result?.folderIds).toEqual([mockFolderId]);
    });

    it("should return null if game is not found", async () => {
      vi.spyOn(Games, "findOneAndUpdate").mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const result = await updateGame("65f1a2b3c4d5e6f7a8b9c0d1", "user_test_123", {
        notes: "Some notes",
      });

      expect(result).toBeNull();
    });

    it("should throw when folderIds include missing or unowned folders", async () => {
      vi.spyOn(Folders, "countDocuments").mockResolvedValue(0);
      const updateSpy = vi.spyOn(Games, "findOneAndUpdate");

      await expect(
        updateGame("65f1a2b3c4d5e6f7a8b9c0d1", "user_test_123", {
          folderIds: ["65f1a2b3c4d5e6f7a8b9c0f9"],
        }),
      ).rejects.toThrow("One or more folders were not found");

      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe("bulkAddFolderIds", () => {
    it("should validate folder ownership before bulk updating games", async () => {
      vi.spyOn(Folders, "countDocuments").mockResolvedValue(1);
      const updateManySpy = vi.spyOn(Games, "updateMany").mockResolvedValue({
        acknowledged: true,
        modifiedCount: 2,
      } as any);

      const modified = await bulkAddFolderIds(
        "user_test_123",
        ["65f1a2b3c4d5e6f7a8b9c0d1", "65f1a2b3c4d5e6f7a8b9c0d2"],
        ["65f1a2b3c4d5e6f7a8b9c0f9", "65f1a2b3c4d5e6f7a8b9c0f9"],
      );

      expect(modified).toBe(2);
      expect(Folders.countDocuments).toHaveBeenCalledWith({
        _id: { $in: [new mongoose.Types.ObjectId("65f1a2b3c4d5e6f7a8b9c0f9")] },
        userId: "user_test_123",
      });
      expect(updateManySpy).toHaveBeenCalledTimes(1);
    });

    it("should throw and skip updateMany if any folder does not belong to user", async () => {
      vi.spyOn(Folders, "countDocuments").mockResolvedValue(1);
      const updateManySpy = vi.spyOn(Games, "updateMany");

      await expect(
        bulkAddFolderIds(
          "user_test_123",
          ["65f1a2b3c4d5e6f7a8b9c0d1"],
          ["65f1a2b3c4d5e6f7a8b9c0f9", "65f1a2b3c4d5e6f7a8b9c0fa"],
        ),
      ).rejects.toThrow("One or more folders were not found");

      expect(updateManySpy).not.toHaveBeenCalled();
    });
  });

  describe("deleteGame", () => {
    it("should return true when game is successfully deleted", async () => {
      vi.spyOn(Games, "deleteOne").mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      } as any);

      const result = await deleteGame("65f1a2b3c4d5e6f7a8b9c0d1", "user_test_123");
      expect(result).toBe(true);
    });

    it("should return false when game was not found to delete", async () => {
      vi.spyOn(Games, "deleteOne").mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      } as any);

      const result = await deleteGame("65f1a2b3c4d5e6f7a8b9c0d1", "user_test_123");
      expect(result).toBe(false);
    });
  });
});
