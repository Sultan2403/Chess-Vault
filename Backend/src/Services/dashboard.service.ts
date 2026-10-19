import Games from "../DB/Models/games.model";
import Folders from "../DB/Models/folders.model";
import {
  DashboardData,
  DashboardRediscoverItem,
  DashboardSummaryMetrics,
  DashboardTendencies,
  Game,
  PlatformType,
} from "@chess-vault/shared";

function mapLeanToGame(doc: any): Game {
  const { _id, folderIds, ...rest } = doc;
  return {
    id: _id.toString(),
    folderIds: folderIds ? folderIds.map((f: any) => f.toString()) : null,
    ...rest,
  };
}

export const getDashboardData = async (
  userId: string,
  platform?: PlatformType | "all",
): Promise<DashboardData> => {
  const queryPlatform = platform && platform !== "all" ? platform : undefined;

  const baseMatch: Record<string, any> = { userId };
  if (queryPlatform) {
    baseMatch.platform = queryPlatform;
  }

  // 1. Parallel metrics calculation
  const [
    totalGames,
    uniqueOpponentsRes,
    totalCollections,
    deepStudies,
    dateRangeRes,
    recentGamesRaw,
    statsRaw,
    topOpeningsRaw,
    milestoneWinRaw,
    marathonRaw,
    notedStudyRaw,
    quickDecisiveRaw,
  ] = await Promise.all([
    // Total games
    Games.countDocuments(baseMatch),

    // Unique opponents
    Games.aggregate([
      { $match: baseMatch },
      {
        $project: {
          opponent: {
            $cond: [
              { $eq: ["$userPlayedAs", "white"] },
              "$blackPlayer.username",
              "$whitePlayer.username",
            ],
          },
        },
      },
      {
        $group: {
          _id: { $toLower: "$opponent" },
        },
      },
      {
        $count: "uniqueCount",
      },
    ]),

    // Total collections/folders (folders are user-wide)
    Folders.countDocuments({ userId }),

    // Deep studies (annotated or tagged)
    Games.countDocuments({
      ...baseMatch,
      $or: [
        { notes: { $exists: true, $ne: null, $nin: [""] } },
        { tags: { $exists: true, $ne: [], $not: { $size: 0 } } },
      ],
    }),

    // Date range
    Games.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          firstGameAt: { $min: "$playedAt" },
          lastGameAt: { $max: "$playedAt" },
        },
      },
    ]),

    // Recent 3 games
    Games.find(baseMatch).sort({ playedAt: -1 }).limit(3).lean(),

    // W/D/L and side performance stats
    Games.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
          draws: { $sum: { $cond: [{ $eq: ["$userResult", "draw"] }, 1, 0] } },
          losses: { $sum: { $cond: [{ $eq: ["$userResult", "loss"] }, 1, 0] } },
          whiteTotal: { $sum: { $cond: [{ $eq: ["$userPlayedAs", "white"] }, 1, 0] } },
          whiteWins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$userPlayedAs", "white"] },
                    { $eq: ["$userResult", "win"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          blackTotal: { $sum: { $cond: [{ $eq: ["$userPlayedAs", "black"] }, 1, 0] } },
          blackWins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$userPlayedAs", "black"] },
                    { $eq: ["$userResult", "win"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    // Top openings
    Games.aggregate([
      {
        $match: {
          ...baseMatch,
          "opening.name": { $exists: true, $ne: null, $nin: [""] },
        },
      },
      {
        $group: {
          _id: "$opening.name",
          eco: { $first: "$opening.eco" },
          count: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]),

    // Milestone win: win against highest rated opponent
    Games.aggregate([
      {
        $match: {
          ...baseMatch,
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
      { $sort: { opponentRating: -1 } },
      { $limit: 1 },
    ]),

    // Marathon battle: highest move count
    Games.find({
      ...baseMatch,
      "moves.count": { $exists: true, $gt: 0 },
    })
      .sort({ "moves.count": -1 })
      .limit(1)
      .lean(),

    // Noted study: most recent game with notes
    Games.find({
      ...baseMatch,
      notes: { $exists: true, $ne: null, $nin: [""] },
    })
      .sort({ playedAt: -1 })
      .limit(1)
      .lean(),

    // Quick decisive win: short win (e.g. 15-28 moves)
    Games.find({
      ...baseMatch,
      userResult: "win",
      "moves.count": { $exists: true, $gte: 10, $lte: 30 },
    })
      .sort({ "moves.count": 1, playedAt: -1 })
      .limit(1)
      .lean(),
  ]);

  // Transform metrics
  const uniqueOpponents = uniqueOpponentsRes[0]?.uniqueCount ?? 0;
  const firstGameAt = dateRangeRes[0]?.firstGameAt
    ? new Date(dateRangeRes[0].firstGameAt).toISOString()
    : null;
  const lastGameAt = dateRangeRes[0]?.lastGameAt
    ? new Date(dateRangeRes[0].lastGameAt).toISOString()
    : null;

  const metrics: DashboardSummaryMetrics = {
    totalGames,
    uniqueOpponents,
    totalCollections,
    deepStudies,
    dateRange: {
      firstGameAt,
      lastGameAt,
    },
  };

  // Transform recent games
  const recentGames: Game[] = recentGamesRaw.map(mapLeanToGame);

  // Transform tendencies
  const stat = statsRaw[0] || {
    total: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    whiteTotal: 0,
    whiteWins: 0,
    blackTotal: 0,
    blackWins: 0,
  };

  const total = stat.total || 0;
  const winPct = total > 0 ? Math.round((stat.wins / total) * 100) : 0;
  const drawPct = total > 0 ? Math.round((stat.draws / total) * 100) : 0;
  const lossPct = total > 0 ? Math.round((stat.losses / total) * 100) : 0;

  const whiteWinPct =
    stat.whiteTotal > 0
      ? Math.round((stat.whiteWins / stat.whiteTotal) * 100)
      : 0;
  const blackWinPct =
    stat.blackTotal > 0
      ? Math.round((stat.blackWins / stat.blackTotal) * 100)
      : 0;

  const topOpenings = topOpeningsRaw.map((o) => ({
    name: o._id,
    eco: o.eco,
    count: o.count,
    winRate: o.count > 0 ? Math.round((o.wins / o.count) * 100) : 0,
  }));

  const longestGameDoc = marathonRaw[0];
  const longestGame = longestGameDoc
    ? {
        movesCount: longestGameDoc.moves?.count ?? 0,
        gameId: longestGameDoc._id.toString(),
        opponentUsername:
          longestGameDoc.userPlayedAs === "white"
            ? longestGameDoc.blackPlayer.username
            : longestGameDoc.whitePlayer.username,
        result: longestGameDoc.userResult,
      }
    : null;

  const tendencies: DashboardTendencies = {
    wins: stat.wins,
    draws: stat.draws,
    losses: stat.losses,
    total,
    winPct,
    drawPct,
    lossPct,
    topOpenings,
    longestGame,
    sidePerformance: {
      whiteWinPct,
      blackWinPct,
    },
  };

  // Build Rediscover Items
  const rediscover: DashboardRediscoverItem[] = [];

  if (milestoneWinRaw[0]) {
    const game = mapLeanToGame(milestoneWinRaw[0]);
    const oppRating =
      game.userPlayedAs === "white"
        ? game.blackPlayer.rating
        : game.whitePlayer.rating;
    rediscover.push({
      id: "milestone-win",
      category: "milestoneWin",
      label: "The Repertoire Milestone",
      badgeText: `Defeated ${oppRating} Rating`,
      game,
      customQuote:
        game.notes ||
        `Decisive victory against ${
          game.userPlayedAs === "white"
            ? game.blackPlayer.username
            : game.whitePlayer.username
        }.`,
    });
  }

  if (marathonRaw[0]) {
    const game = mapLeanToGame(marathonRaw[0]);
    rediscover.push({
      id: "marathon-battle",
      category: "marathonBattle",
      label: "The Marathon Battle",
      badgeText: `${game.moves?.count ?? 0} Full Moves`,
      game,
      customQuote:
        game.notes ||
        `An intense endgame struggle lasting ${game.moves?.count ?? 0} moves against ${
          game.userPlayedAs === "white"
            ? game.blackPlayer.username
            : game.whitePlayer.username
        }.`,
    });
  }

  if (notedStudyRaw[0]) {
    const game = mapLeanToGame(notedStudyRaw[0]);
    rediscover.push({
      id: "noted-study",
      category: "notedStudy",
      label: "Personal Study",
      badgeText: "Annotated Game",
      game,
      customQuote: game.notes,
    });
  }

  if (quickDecisiveRaw[0] && quickDecisiveRaw[0]._id.toString() !== milestoneWinRaw[0]?._id?.toString()) {
    const game = mapLeanToGame(quickDecisiveRaw[0]);
    rediscover.push({
      id: "quick-decisive",
      category: "quickDecisive",
      label: "Quick Attack",
      badgeText: `${game.moves?.count ?? 0} Moves`,
      game,
      customQuote:
        game.notes ||
        `Swift tactical conversion in only ${game.moves?.count ?? 0} moves.`,
    });
  }

  // If no milestone games matched (e.g. few games), fallback to first recent game
  if (rediscover.length === 0 && recentGames.length > 0) {
    rediscover.push({
      id: "latest-game",
      category: "milestoneWin",
      label: "Featured Game",
      badgeText: "Recent Battle",
      game: recentGames[0],
      customQuote: recentGames[0].notes || "Featured game from your vault archive.",
    });
  }

  return {
    platform: queryPlatform || "all",
    metrics,
    rediscover,
    recentGames,
    tendencies,
  };
};
