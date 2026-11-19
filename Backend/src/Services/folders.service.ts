import mongoose from "mongoose";
import Folders from "../DB/Models/folders.model";
import Games from "../DB/Models/games.model";
import {
  CreateFolderInput,
  FolderCoverGame,
  FolderItem,
  PaginatedFolders,
  UpdateFolderInput,
  CollectionSummary,
  CollectionDiscovery,
  Game,
  ListFolderGamesQuery,
  PaginatedFolderGames,
} from "../Types/folder.types";

function mapLeanToGame(doc: any): Game {
  const { _id, folderIds, ...rest } = doc;
  return {
    id: _id.toString(),
    folderIds: folderIds ? folderIds.map((f: any) => f.toString()) : null,
    ...rest,
  };
}

export const getUserFolders = async (
  userId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedFolders> => {
  const pageNumber = Math.max(1, page);
  const limitNumber = Math.max(1, Math.min(100, limit));
  const skip = (pageNumber - 1) * limitNumber;

  const [folders, total] = await Promise.all([
    Folders.find({ userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Folders.countDocuments({ userId }),
  ]);

  const folderIds = folders.map((f) => f._id);

  // Compute gameCount and latest cover game for each folder in parallel
  const [countsAgg, coversAgg] = await Promise.all([
    Games.aggregate([
      {
        $match: {
          userId,
          folderIds: { $in: folderIds },
        },
      },
      { $unwind: "$folderIds" },
      {
        $match: {
          folderIds: { $in: folderIds },
        },
      },
      {
        $group: {
          _id: "$folderIds",
          count: { $sum: 1 },
        },
      },
    ]),
    Games.aggregate([
      {
        $match: {
          userId,
          folderIds: { $in: folderIds },
        },
      },
      { $unwind: "$folderIds" },
      {
        $match: {
          folderIds: { $in: folderIds },
        },
      },
      { $sort: { playedAt: -1 } },
      {
        $group: {
          _id: "$folderIds",
          gameId: { $first: "$_id" },
          finalFen: { $first: "$finalFen" },
          playedAt: { $first: "$playedAt" },
          whitePlayer: { $first: "$whitePlayer" },
          blackPlayer: { $first: "$blackPlayer" },
        },
      },
    ]),
  ]);

  const countsMap = new Map<string, number>();
  countsAgg.forEach((item) => {
    countsMap.set(item._id.toString(), item.count);
  });

  const coversMap = new Map<string, FolderCoverGame>();
  coversAgg.forEach((item) => {
    coversMap.set(item._id.toString(), {
      id: item.gameId.toString(),
      finalFen: item.finalFen,
      playedAt: item.playedAt,
      whitePlayer: item.whitePlayer,
      blackPlayer: item.blackPlayer,
    });
  });

  const folderItems: FolderItem[] = folders.map((f) => {
    const { _id, __v, ...rest } = f;
    const fId = _id.toString();
    return {
      id: fId,
      ...rest,
      gameCount: countsMap.get(fId) ?? 0,
      coverGame: coversMap.get(fId),
    };
  });

  return {
    folders: folderItems,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};

export const getFolderById = async (id: string, userId: string) => {
  const folder = await Folders.findOne({ _id: id, userId }).lean();
  if (!folder) return null;
  const { _id, __v, ...rest } = folder;
  return { id: _id.toString(), ...rest };
};

export const getFolderGames = async (
  folderId: string,
  userId: string,
  query: ListFolderGamesQuery,
): Promise<PaginatedFolderGames | null> => {
  const folder = await getFolderById(folderId, userId);
  if (!folder) return null;

  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, Math.min(100, query.limit ?? 12));
  const skip = (page - 1) * limit;

  const folderObjectId = new mongoose.Types.ObjectId(folderId);
  const matchFilter: Record<string, any> = {
    userId,
    folderIds: folderObjectId,
    ...(query.userPlayedAs && { userPlayedAs: query.userPlayedAs }),
    ...(query.search && {
      $or: [
        { title: { $regex: query.search, $options: "i" } },
        { "whitePlayer.username": { $regex: query.search, $options: "i" } },
        { "blackPlayer.username": { $regex: query.search, $options: "i" } },
        { notes: { $regex: query.search, $options: "i" } },
        { tags: { $regex: query.search, $options: "i" } },
        { "opening.name": { $regex: query.search, $options: "i" } },
        { "opening.variation": { $regex: query.search, $options: "i" } },
      ],
    }),
  };

  const [gamesRaw, total] = await Promise.all([
    Games.find(matchFilter)
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Games.countDocuments(matchFilter),
  ]);

  return {
    games: gamesRaw.map(mapLeanToGame),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getFolderSummary = async (
  id: string,
  userId: string,
): Promise<CollectionSummary | null> => {
  const folder = await getFolderById(id, userId);
  if (!folder) return null;

  const folderObjectId = new mongoose.Types.ObjectId(id);
  const matchFilter = {
    userId,
    folderIds: folderObjectId,
  };

  const [
    gameCount,
    latestGameDoc,
    milestoneWinRaw,
    marathonRaw,
    notedStudyRaw,
    quickDecisiveRaw,
  ] = await Promise.all([
    Games.countDocuments(matchFilter),
    Games.findOne(matchFilter).sort({ playedAt: -1 }).lean(),

    // 1. Milestone Win: Highest rated opponent defeated in this collection
    Games.aggregate([
      {
        $match: {
          ...matchFilter,
          userResult: "win",
        },
      },
      {
        $addFields: {
          opponentRating: {
            $cond: [
              { $eq: ["$userPlayedAs", "white"] },
              "$blackPlayer.rating",
              "$whitePlayer.rating",
            ],
          },
        },
      },
      { $match: { opponentRating: { $gt: 0 } } },
      { $sort: { opponentRating: -1 } },
      { $limit: 1 },
    ]),

    // 2. Marathon battle: Highest move count in this collection (min 40 moves)
    Games.find({
      ...matchFilter,
      "moves.count": { $exists: true, $gte: 40 },
    })
      .sort({ "moves.count": -1 })
      .limit(1)
      .lean(),

    // 3. Noted study: Game in this collection with personal notes
    Games.find({
      ...matchFilter,
      notes: { $exists: true, $ne: null, $nin: [""] },
    })
      .sort({ playedAt: -1 })
      .limit(1)
      .lean(),

    // 4. Quick Miniature: Decisive win between 10 and 25 moves
    Games.find({
      ...matchFilter,
      userResult: "win",
      "moves.count": { $exists: true, $gte: 10, $lte: 25 },
    })
      .sort({ "moves.count": 1, playedAt: -1 })
      .limit(1)
      .lean(),
  ]);

  const coverGame: FolderCoverGame | undefined = latestGameDoc
    ? {
        id: (latestGameDoc as any)._id.toString(),
        finalFen: (latestGameDoc as any).finalFen,
        playedAt: (latestGameDoc as any).playedAt,
        whitePlayer: (latestGameDoc as any).whitePlayer,
        blackPlayer: (latestGameDoc as any).blackPlayer,
      }
    : undefined;

  const discoveries: CollectionDiscovery[] = [];
  const seenGameIds = new Set<string>();

  // A. Biggest Win
  if (milestoneWinRaw.length > 0) {
    const raw = milestoneWinRaw[0];
    const game = mapLeanToGame(raw);
    const opponent =
      game.userPlayedAs === "white" ? game.blackPlayer : game.whitePlayer;
    discoveries.push({
      id: `win-${game.id}`,
      category: "biggest_win",
      label: "Biggest Win",
      badgeText: `${opponent.rating} Elo`,
      storyQuote: `You defeated ${opponent.username} (${opponent.rating}) playing as ${game.userPlayedAs}.`,
      game,
      isPrimary: true,
    });
    seenGameIds.add(game.id);
  }

  // B. Marathon Battle
  if (marathonRaw.length > 0) {
    const raw = marathonRaw[0];
    const game = mapLeanToGame(raw);
    if (!seenGameIds.has(game.id)) {
      const moveCount = game.moves?.count ?? 0;
      const opponent =
        game.userPlayedAs === "white" ? game.blackPlayer : game.whitePlayer;
      const resultText =
        game.userResult === "win"
          ? "Victory"
          : game.userResult === "draw"
            ? "Hard-fought draw"
            : "Clash";
      discoveries.push({
        id: `marathon-${game.id}`,
        category: "marathon_battle",
        label: "Marathon Battle",
        badgeText: `${moveCount} Moves`,
        storyQuote: `A grueling ${moveCount}-move test of endurance against ${opponent.username} (${resultText}).`,
        game,
        isPrimary: discoveries.length === 0,
      });
      seenGameIds.add(game.id);
    }
  }

  // C. Personal Note / Deep Study
  if (notedStudyRaw.length > 0) {
    const raw = notedStudyRaw[0];
    const game = mapLeanToGame(raw);
    if (!seenGameIds.has(game.id)) {
      const excerpt =
        (game.notes?.length ?? 0) > 80
          ? `${game.notes?.slice(0, 77)}...`
          : game.notes ?? "Personal study and reflections.";
      discoveries.push({
        id: `note-${game.id}`,
        category: "personal_note",
        label: "Personal Notebook",
        badgeText: "Study",
        storyQuote: `"${excerpt}"`,
        game,
        isPrimary: discoveries.length === 0,
      });
      seenGameIds.add(game.id);
    }
  }

  // D. Quick Miniature
  if (quickDecisiveRaw.length > 0) {
    const raw = quickDecisiveRaw[0];
    const game = mapLeanToGame(raw);
    if (!seenGameIds.has(game.id)) {
      const moveCount = game.moves?.count ?? 0;
      const opponent =
        game.userPlayedAs === "white" ? game.blackPlayer : game.whitePlayer;
      discoveries.push({
        id: `miniature-${game.id}`,
        category: "quick_miniature",
        label: "Swift Strike",
        badgeText: `${moveCount} Moves`,
        storyQuote: `Decisive ${moveCount}-move takedown of ${opponent.username}.`,
        game,
        isPrimary: discoveries.length === 0,
      });
      seenGameIds.add(game.id);
    }
  }

  return {
    folder,
    gameCount,
    coverGame,
    discoveries,
  };
};

export const createFolder = async (payload: CreateFolderInput) => {
  const folder = new Folders(payload);
  return await folder.save();
};

export const updateFolder = async (
  id: string,
  userId: string,
  payload: UpdateFolderInput,
) => {
  const folder = await Folders.findOneAndUpdate(
    { _id: id, userId },
    { $set: payload },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!folder) return null;
  const { _id, __v, ...rest } = folder;
  return { id: _id.toString(), ...rest };
};

export const deleteFolder = async (id: string, userId: string) => {
  const result = await Folders.deleteOne({ _id: id, userId });
  return result.deletedCount === 1;
};
