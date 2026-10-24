import mongoose from "mongoose";
import Games from "../DB/Models/games.model";
import {
  Game,
  GameSearchParams,
  UpdateGameInput,
} from "../Types/games.types";

export const searchGames = async ({
  page = 1,
  limit = 15,
  search,
  ...params
}: GameSearchParams): Promise<{
  success: boolean;
  message: string;
  games: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const skip = (page - 1) * limit;

  const { folderIds, timeClass, ...restParams } = params;

  const query = {
    ...restParams,
    ...(timeClass && { "time.timeClass": timeClass }),
    ...(folderIds && folderIds.length > 0
      ? {
          folderIds: {
            $in: folderIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        }
      : {}),
    ...(search && {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { "whitePlayer.username": { $regex: search, $options: "i" } },
        { "blackPlayer.username": { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { "opening.name": { $regex: search, $options: "i" } },
        { "opening.variation": { $regex: search, $options: "i" } },
      ],
    }),
  };

  const [games, count] = await Promise.all([
    Games.find(query)
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .transform((games) =>
        games.map((game: any) => {
          const { _id, folderIds, ...rest } = game;

          const normalized: Game = {
            id: _id.toString(),
            folderIds: folderIds
              ? folderIds.map((id: any) => id.toString())
              : null,
            ...rest,
          };

          return normalized;
        }),
      ),

    Games.countDocuments(query),
  ]);

  return {
    success: true,
    message: "Games fetched successfully",
    games,

    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getGameById = async (
  id: string,
  userId: string,
): Promise<Game | null> => {
  const game = await Games.findOne({ _id: id, userId }).lean();
  if (!game) return null;

  const { _id, folderIds, ...rest } = game as any;
  return {
    id: _id.toString(),
    folderIds: folderIds ? folderIds.map((id: any) => id.toString()) : null,
    ...rest,
  };
};

export const updateGame = async (
  id: string,
  userId: string,
  updateData: UpdateGameInput,
): Promise<Game | null> => {
  const { folderIds, ...rest } = updateData;
  const updatePayload: Partial<{
    title?: string;
    notes?: string;
    tags?: string[];
    folderIds?: mongoose.Types.ObjectId[] | null;
  }> = { ...rest };

  if (folderIds !== undefined) {
    updatePayload.folderIds = folderIds
      ? folderIds.map((fId) => new mongoose.Types.ObjectId(fId))
      : null;
  }

  const game = await Games.findOneAndUpdate(
    { _id: id, userId },
    { $set: updatePayload },
    { returnDocument: "after", runValidators: true },
  ).lean();

  if (!game) return null;

  const {
    _id,
    folderIds: updatedFolderIds,
    ...gameRest
  } = game as unknown as {
    _id: mongoose.Types.ObjectId | string;
    folderIds?: (mongoose.Types.ObjectId | string)[] | null;
  } & Omit<Game, "id" | "folderIds">;

  return {
    id: _id.toString(),
    folderIds: updatedFolderIds
      ? updatedFolderIds.map((fId) => fId.toString())
      : null,
    ...gameRest,
  };
};

export const deleteGame = async (
  id: string,
  userId: string,
): Promise<boolean> => {
  const result = await Games.deleteOne({ _id: id, userId });
  return result.deletedCount === 1;
};

export const bulkAddFolderIds = async (
  userId: string,
  gameIds: string[],
  folderIds: string[],
): Promise<number> => {
  const gameObjectIds = gameIds.map((id) => new mongoose.Types.ObjectId(id));
  const folderObjectIds = folderIds.map((id) => new mongoose.Types.ObjectId(id));

  const result = await Games.updateMany(
    { _id: { $in: gameObjectIds }, userId },
    [
      {
        $set: {
          folderIds: {
            $setUnion: [{ $ifNull: ["$folderIds", []] }, folderObjectIds],
          },
        },
      },
    ],
    { updatePipeline: true },
  );

  return result.modifiedCount;
};

export const bulkDeleteGames = async (
  userId: string,
  gameIds: string[],
): Promise<number> => {
  const gameObjectIds = gameIds.map((id) => new mongoose.Types.ObjectId(id));

  const result = await Games.deleteMany({
    _id: { $in: gameObjectIds },
    userId,
  });

  return result.deletedCount;
};