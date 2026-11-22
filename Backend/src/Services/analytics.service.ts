import Games from "../DB/Models/games.model";
import {
  AnalyticsData,
  AnalyticsMoveBucket,
  AnalyticsOpeningStat,
  AnalyticsOpponentStat,
  AnalyticsPlatformStat,
  AnalyticsQuery,
  AnalyticsTerminationStat,
  AnalyticsTimeClassStat,
  PlatformType,
  TimeClassType,
} from "@chess-vault/shared";

function safePct(value: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}

export const getAnalyticsData = async (
  userId: string,
  query: Partial<AnalyticsQuery> = {},
): Promise<AnalyticsData> => {
  const { platform = "all", timeClass = "all", from, to } = query;

  const matchQuery: Record<string, any> = { userId };

  if (platform && platform !== "all") {
    matchQuery.platform = platform;
  }

  if (timeClass && timeClass !== "all") {
    matchQuery["time.timeClass"] = timeClass;
  }

  if (from || to) {
    matchQuery.playedAt = {};
    if (from) {
      matchQuery.playedAt.$gte = new Date(from);
    }
    if (to) {
      matchQuery.playedAt.$lte = new Date(to);
    }
  }

  const [facetResults, streakGames] = await Promise.all([
    Games.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalGames: { $sum: 1 },
                wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
                losses: { $sum: { $cond: [{ $eq: ["$userResult", "loss"] }, 1, 0] } },
                draws: { $sum: { $cond: [{ $eq: ["$userResult", "draw"] }, 1, 0] } },
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
                whiteLosses: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$userPlayedAs", "white"] },
                          { $eq: ["$userResult", "loss"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                whiteDraws: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$userPlayedAs", "white"] },
                          { $eq: ["$userResult", "draw"] },
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
                blackLosses: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$userPlayedAs", "black"] },
                          { $eq: ["$userResult", "loss"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                blackDraws: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$userPlayedAs", "black"] },
                          { $eq: ["$userResult", "draw"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                avgMoves: { $avg: "$moves.count" },
                ratedTotal: { $sum: { $cond: ["$isRated", 1, 0] } },
                ratedWins: {
                  $sum: {
                    $cond: [
                      {
                        $and: ["$isRated", { $eq: ["$userResult", "win"] }],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],

          byPlatform: [
            {
              $group: {
                _id: "$platform",
                total: { $sum: 1 },
                wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
                losses: { $sum: { $cond: [{ $eq: ["$userResult", "loss"] }, 1, 0] } },
                draws: { $sum: { $cond: [{ $eq: ["$userResult", "draw"] }, 1, 0] } },
              },
            },
            { $sort: { total: -1 } },
          ],

          byTimeClass: [
            {
              $group: {
                _id: "$time.timeClass",
                total: { $sum: 1 },
                wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
                losses: { $sum: { $cond: [{ $eq: ["$userResult", "loss"] }, 1, 0] } },
                draws: { $sum: { $cond: [{ $eq: ["$userResult", "draw"] }, 1, 0] } },
              },
            },
            { $sort: { total: -1 } },
          ],

          byOpening: [
            {
              $match: {
                "opening.name": { $exists: true, $ne: null, $nin: [""] },
              },
            },
            {
              $group: {
                _id: {
                  name: "$opening.name",
                  eco: "$opening.eco",
                  color: "$userPlayedAs",
                },
                total: { $sum: 1 },
                wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
                losses: { $sum: { $cond: [{ $eq: ["$userResult", "loss"] }, 1, 0] } },
                draws: { $sum: { $cond: [{ $eq: ["$userResult", "draw"] }, 1, 0] } },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 40 },
          ],

          topOpponents: [
            {
              $project: {
                opponent: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$blackPlayer.username",
                    "$whitePlayer.username",
                  ],
                },
                userResult: 1,
              },
            },
            {
              $group: {
                _id: { $toLower: "$opponent" },
                username: { $first: "$opponent" },
                total: { $sum: 1 },
                wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
                losses: { $sum: { $cond: [{ $eq: ["$userResult", "loss"] }, 1, 0] } },
                draws: { $sum: { $cond: [{ $eq: ["$userResult", "draw"] }, 1, 0] } },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 10 },
          ],

          uniqueOpponents: [
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
              $count: "count",
            },
          ],

          terminations: [
            {
              $group: {
                _id: {
                  termination: "$termination",
                  userResult: "$userResult",
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],

          moveBuckets: [
            {
              $bucket: {
                groupBy: "$moves.count",
                boundaries: [0, 21, 41, 1000],
                default: "other",
                output: {
                  count: { $sum: 1 },
                  wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
                },
              },
            },
          ],

          activityTrends: [
            {
              $group: {
                _id: {
                  year: { $year: "$playedAt" },
                  month: { $month: "$playedAt" },
                },
                count: { $sum: 1 },
                wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
                losses: { $sum: { $cond: [{ $eq: ["$userResult", "loss"] }, 1, 0] } },
                draws: { $sum: { $cond: [{ $eq: ["$userResult", "draw"] }, 1, 0] } },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],

          milestoneVictory: [
            { $match: { userResult: "win" } },
            {
              $addFields: {
                opponentRating: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$blackPlayer.rating",
                    "$whitePlayer.rating",
                  ],
                },
                opponentUsername: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$blackPlayer.username",
                    "$whitePlayer.username",
                  ],
                },
              },
            },
            { $sort: { opponentRating: -1 } },
            { $limit: 1 },
          ],
        },
      },
    ]),

    // Lightweight chronological projection for streak analysis
    Games.find(matchQuery, { userResult: 1, playedAt: 1 })
      .sort({ playedAt: 1 })
      .lean(),
  ]);

  const raw = facetResults[0] || {};

  // 1. Overview processing
  const ov = raw.overview?.[0] || {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    whiteTotal: 0,
    whiteWins: 0,
    whiteLosses: 0,
    whiteDraws: 0,
    blackTotal: 0,
    blackWins: 0,
    blackLosses: 0,
    blackDraws: 0,
    avgMoves: 0,
    ratedTotal: 0,
    ratedWins: 0,
  };

  const totalGames = ov.totalGames || 0;
  const overview = {
    totalGames,
    wins: ov.wins || 0,
    losses: ov.losses || 0,
    draws: ov.draws || 0,
    winPct: safePct(ov.wins, totalGames),
    lossPct: safePct(ov.losses, totalGames),
    drawPct: safePct(ov.draws, totalGames),
    avgMoves: ov.avgMoves ? Math.round(ov.avgMoves) : 0,
    white: {
      total: ov.whiteTotal || 0,
      wins: ov.whiteWins || 0,
      losses: ov.whiteLosses || 0,
      draws: ov.whiteDraws || 0,
      winPct: safePct(ov.whiteWins, ov.whiteTotal),
    },
    black: {
      total: ov.blackTotal || 0,
      wins: ov.blackWins || 0,
      losses: ov.blackLosses || 0,
      draws: ov.blackDraws || 0,
      winPct: safePct(ov.blackWins, ov.blackTotal),
    },
    rated: {
      total: ov.ratedTotal || 0,
      wins: ov.ratedWins || 0,
      winPct: safePct(ov.ratedWins, ov.ratedTotal),
    },
  };

  // 2. By platform
  const byPlatform: AnalyticsPlatformStat[] = (raw.byPlatform || []).map((p: any) => ({
    platform: p._id as PlatformType,
    total: p.total,
    wins: p.wins,
    losses: p.losses,
    draws: p.draws,
    winPct: safePct(p.wins, p.total),
  }));

  // 3. By time class
  const byTimeClass: AnalyticsTimeClassStat[] = (raw.byTimeClass || []).map((t: any) => ({
    timeClass: t._id as TimeClassType,
    total: t.total,
    wins: t.wins,
    losses: t.losses,
    draws: t.draws,
    winPct: safePct(t.wins, t.total),
  }));

  // 4. Openings breakdown
  const openingsAsWhite: AnalyticsOpeningStat[] = [];
  const openingsAsBlack: AnalyticsOpeningStat[] = [];

  for (const op of raw.byOpening || []) {
    const stat: AnalyticsOpeningStat = {
      name: op._id.name,
      eco: op._id.eco,
      color: op._id.color,
      total: op.total,
      wins: op.wins,
      losses: op.losses,
      draws: op.draws,
      winPct: safePct(op.wins, op.total),
    };

    if (op._id.color === "white") {
      openingsAsWhite.push(stat);
    } else {
      openingsAsBlack.push(stat);
    }
  }

  // Determine signature weapon (highest win rate with at least 3 games) and vulnerable opening
  const allOpenings = [...openingsAsWhite, ...openingsAsBlack];
  const eligibleSignature = allOpenings
    .filter((o) => o.total >= 3)
    .sort((a, b) => b.winPct - a.winPct || b.total - a.total);
  const signatureWeapon = eligibleSignature.length > 0 ? eligibleSignature[0] : null;

  const eligibleVulnerable = allOpenings
    .filter((o) => o.total >= 3 && o.winPct < 50)
    .sort((a, b) => a.winPct - b.winPct || b.total - a.total);
  const vulnerableOpening = eligibleVulnerable.length > 0 ? eligibleVulnerable[0] : null;

  const openings = {
    asWhite: openingsAsWhite.slice(0, 10),
    asBlack: openingsAsBlack.slice(0, 10),
    signatureWeapon,
    vulnerableOpening,
  };

  // 5. Opponents breakdown
  const totalUnique = raw.uniqueOpponents?.[0]?.count || 0;
  const topRivals: AnalyticsOpponentStat[] = (raw.topOpponents || [])
    .slice(0, 5)
    .map((o: any) => ({
      username: o.username || o._id,
      total: o.total,
      wins: o.wins,
      losses: o.losses,
      draws: o.draws,
      winPct: safePct(o.wins, o.total),
    }));

  const milestoneRaw = raw.milestoneVictory?.[0];
  const milestoneVictory = milestoneRaw
    ? {
        opponentUsername: milestoneRaw.opponentUsername,
        opponentRating: milestoneRaw.opponentRating,
        playedAt: milestoneRaw.playedAt,
        gameId: milestoneRaw._id.toString(),
        timeClass: milestoneRaw.time?.timeClass || "standard",
        userPlayedAs: milestoneRaw.userPlayedAs,
      }
    : null;

  const opponents = {
    totalUnique,
    topRivals,
    milestoneVictory,
  };

  // 6. Terminations breakdown
  const winWays = { checkmate: 0, resignation: 0, timeout: 0, other: 0 };
  const lossWays = { checkmate: 0, resignation: 0, timeout: 0, other: 0 };

  const terminationBreakdown: AnalyticsTerminationStat[] = (raw.terminations || []).map(
    (t: any) => {
      const term = t._id.termination || "unknown";
      const uRes = t._id.userResult as "win" | "loss" | "draw";
      const count = t.count;

      if (uRes === "win") {
        if (term === "checkmate") winWays.checkmate += count;
        else if (term === "resignation") winWays.resignation += count;
        else if (term === "timeout" || term === "timeout-vs-insufficient-material")
          winWays.timeout += count;
        else winWays.other += count;
      } else if (uRes === "loss") {
        if (term === "checkmate") lossWays.checkmate += count;
        else if (term === "resignation") lossWays.resignation += count;
        else if (term === "timeout" || term === "timeout-vs-insufficient-material")
          lossWays.timeout += count;
        else lossWays.other += count;
      }

      return {
        termination: term,
        userResult: uRes,
        count,
        percentage: safePct(count, totalGames),
      };
    },
  );

  const terminations = {
    winWays,
    lossWays,
    breakdown: terminationBreakdown,
  };

  // 7. Move count buckets
  const bucketMap: Record<number | string, { count: number; wins: number }> = {};
  for (const b of raw.moveBuckets || []) {
    bucketMap[b._id] = { count: b.count, wins: b.wins };
  }

  const fastBucket = bucketMap[0] || { count: 0, wins: 0 };
  const mediumBucket = bucketMap[21] || { count: 0, wins: 0 };
  const longBucket = bucketMap[41] || { count: 0, wins: 0 };

  const moveBuckets: AnalyticsMoveBucket[] = [
    {
      bucket: "fast",
      label: "≤ 20 moves",
      count: fastBucket.count,
      wins: fastBucket.wins,
      winPct: safePct(fastBucket.wins, fastBucket.count),
    },
    {
      bucket: "medium",
      label: "21-40 moves",
      count: mediumBucket.count,
      wins: mediumBucket.wins,
      winPct: safePct(mediumBucket.wins, mediumBucket.count),
    },
    {
      bucket: "long",
      label: "41+ moves",
      count: longBucket.count,
      wins: longBucket.wins,
      winPct: safePct(longBucket.wins, longBucket.count),
    },
  ];

  // 8. Activity trends
  const activityTrends = (raw.activityTrends || []).map((a: any) => {
    const yearStr = String(a._id.year);
    const monthStr = String(a._id.month).padStart(2, "0");
    return {
      period: `${yearStr}-${monthStr}`,
      count: a.count,
      wins: a.wins,
      losses: a.losses,
      draws: a.draws,
      winPct: safePct(a.wins, a.count),
    };
  });

  // 9. Streaks
  let longestWinStreak = 0;
  let runningWinStreak = 0;
  let currentStreakCount = 0;
  let currentStreakType: "win" | "loss" | "draw" | "none" = "none";

  for (const g of streakGames) {
    const res = g.userResult;
    if (res === "win") {
      runningWinStreak += 1;
      if (runningWinStreak > longestWinStreak) {
        longestWinStreak = runningWinStreak;
      }
    } else {
      runningWinStreak = 0;
    }

    if (currentStreakType === "none" || currentStreakType === res) {
      currentStreakType = res as "win" | "loss" | "draw";
      currentStreakCount += 1;
    } else {
      currentStreakType = res as "win" | "loss" | "draw";
      currentStreakCount = 1;
    }
  }

  const streaks = {
    currentStreak: {
      count: currentStreakCount,
      type: currentStreakType,
    },
    longestWinStreak,
  };

  return {
    query: {
      platform: (platform as PlatformType) || "all",
      timeClass: (timeClass as TimeClassType) || "all",
      from,
      to,
    },
    overview,
    byPlatform,
    byTimeClass,
    openings,
    opponents,
    terminations,
    moveBuckets,
    activityTrends,
    streaks,
  };
};
