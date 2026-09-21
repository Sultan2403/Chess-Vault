import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import Games from "../../src/DB/Models/games.model";
import { updateGame, deleteGame } from "../../src/Services/games.service";

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
        folderIds: [new mongoose.Types.ObjectId(mockFolderId)],
        platform: "chess.com",
        platformGameId: "123456",
        sourceUrl: "https://chess.com/game/123456",
        whitePlayer: { username: "Magnus", rating: 2850 },
        blackPlayer: { username: "Hikaru", rating: 2820 },
        result: "white",
        isRated: true,
        timeClass: "blitz",
        playedAt: new Date("2026-01-01T00:00:00Z"),
        pgn: "1. e4 e5",
        title: "Magnus vs Hikaru Blitz Final",
        notes: "Great game",
        tags: "blitz",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(Games, "findOneAndUpdate").mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockDbResult),
      } as any);

      const result = await updateGame(mockGameId, mockUserId, {
        title: "Magnus vs Hikaru Blitz Final",
        notes: "Great game",
        tags: "blitz",
        folderIds: [mockFolderId],
      });

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockGameId);
      expect(result?.title).toBe("Magnus vs Hikaru Blitz Final");
      expect(result?.notes).toBe("Great game");
      expect(result?.tags).toBe("blitz");
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
