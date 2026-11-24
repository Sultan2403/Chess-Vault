import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import Folders from "../../src/DB/Models/folders.model";
import Games from "../../src/DB/Models/games.model";
import {
  deleteFolder,
  validateUserFolderIds,
} from "../../src/Services/folders.service";

describe("Folders Service Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateUserFolderIds", () => {
    it("should deduplicate and return ObjectIds when all folders belong to the user", async () => {
      const folderId1 = "65f1a2b3c4d5e6f7a8b9c0f1";
      const folderId2 = "65f1a2b3c4d5e6f7a8b9c0f2";

      vi.spyOn(Folders, "countDocuments").mockResolvedValue(2);

      const result = await validateUserFolderIds("user_123", [
        folderId1,
        folderId2,
        folderId1,
      ]);

      expect(result).toHaveLength(2);
      expect(result.map((id) => id.toString())).toEqual([folderId1, folderId2]);
      expect(Folders.countDocuments).toHaveBeenCalledWith({
        _id: {
          $in: [
            new mongoose.Types.ObjectId(folderId1),
            new mongoose.Types.ObjectId(folderId2),
          ],
        },
        userId: "user_123",
      });
    });

    it("should throw when any folder is missing or owned by another user", async () => {
      vi.spyOn(Folders, "countDocuments").mockResolvedValue(1);

      await expect(
        validateUserFolderIds("user_123", [
          "65f1a2b3c4d5e6f7a8b9c0f1",
          "65f1a2b3c4d5e6f7a8b9c0f2",
        ]),
      ).rejects.toThrow("One or more folders were not found");
    });
  });

  describe("deleteFolder", () => {
    it("should delete the folder and pull its ID from affected user games", async () => {
      const folderId = "65f1a2b3c4d5e6f7a8b9c0f1";

      vi.spyOn(Folders, "deleteOne").mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      } as any);
      const updateManySpy = vi.spyOn(Games, "updateMany").mockResolvedValue({
        acknowledged: true,
        modifiedCount: 3,
      } as any);

      const deleted = await deleteFolder(folderId, "user_123");

      expect(deleted).toBe(true);
      expect(updateManySpy).toHaveBeenCalledWith(
        {
          userId: "user_123",
          folderIds: new mongoose.Types.ObjectId(folderId),
        },
        expect.any(Array),
        { updatePipeline: true },
      );
    });

    it("should return false and skip game cleanup if folder was not found", async () => {
      vi.spyOn(Folders, "deleteOne").mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      } as any);
      const updateManySpy = vi.spyOn(Games, "updateMany");

      const deleted = await deleteFolder("65f1a2b3c4d5e6f7a8b9c0f1", "user_123");

      expect(deleted).toBe(false);
      expect(updateManySpy).not.toHaveBeenCalled();
    });
  });
});
