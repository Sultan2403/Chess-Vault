import Games from "../DB/Models/games.model";
import { redis } from "../DB/Connections/redis";
import { CACHE_KEYS, CACHE_TTL } from "../Config/constants";
import {
  AnalyticsActivityTrend,
  AnalyticsArchiveSpan,
  AnalyticsData,
  AnalyticsGameHighlight,
  AnalyticsGameLength,
  AnalyticsMoveBucket,
  AnalyticsOpeningStat,
  AnalyticsOptimalWindow,
  AnalyticsOpponentStat,
  AnalyticsPlatformRatingBrackets,
  AnalyticsPlatformRatingProgression,
  AnalyticsPlatformStat,
  AnalyticsQuery,
  AnalyticsRatingBracket,
  AnalyticsRatingPoint,
  AnalyticsStreaks,
  AnalyticsTerminationStat,
  AnalyticsTimeClassStat,
  PlatformType,
  TimeClassType,
} from "@chess-vault/shared";

function safePct(value: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}

function formatSpan(firstDate: Date | null, lastDate: Date | null): string {
  if (!firstDate || !lastDate) return "0m";
  const start = new Date(firstDate);
  const end = new Date(lastDate);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) {
    return months > 0 ? `${years}y ${months}m` : `${years}y`;
  }
  return `${Math.max(1, months)}m`;
}

function computeRatingBrackets(
  rawList: { oppRating: number; userResult: "win" | "loss" | "draw" }[]
): AnalyticsRatingBracket[] {
  const ratings = rawList
    .map((b) => b.oppRating)
    .filter((r) => typeof r === "number" && r > 0);

  if (ratings.length === 0) {
    return [
      { bracket: "> 2300", label: "> 2300 Elo", total: 0, wins: 0, winPct: 0 },
      { bracket: "2100 - 2300", label: "2100 - 2300 Elo", total: 0, wins: 0, winPct: 0 },
      { bracket: "1900 - 2100", label: "1900 - 2100 Elo", total: 0, wins: 0, winPct: 0 },
      { bracket: "< 1900", label: "< 1900 Elo", total: 0, wins: 0, winPct: 0 },
    ];
  }

  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  if (maxRating - minRating < 40) {
    const count = rawList.length;
    const wins = rawList.filter((b) => b.userResult === "win").length;
    return [
      {
        bracket: `${minRating} - ${maxRating}`,
        label: `${minRating} - ${maxRating} Elo`,
        total: count,
        wins,
        winPct: safePct(wins, count),
      },
    ];
  }

  const step = (maxRating - minRating) / 4;
  const q1 = Math.round(minRating + step);
  const q2 = Math.round(minRating + step * 2);
  const q3 = Math.round(minRating + step * 3);

  const b4 = { count: 0, wins: 0 };
  const b3 = { count: 0, wins: 0 };
  const b2 = { count: 0, wins: 0 };
  const b1 = { count: 0, wins: 0 };

  for (const item of rawList) {
    const isWin = item.userResult === "win";
    if (item.oppRating > q3) {
      b4.count += 1;
      if (isWin) b4.wins += 1;
    } else if (item.oppRating > q2) {
      b3.count += 1;
      if (isWin) b3.wins += 1;
    } else if (item.oppRating > q1) {
      b2.count += 1;
      if (isWin) b2.wins += 1;
    } else {
      b1.count += 1;
      if (isWin) b1.wins += 1;
    }
  }

  return [
    {
      bracket: `> ${q3}`,
      label: `> ${q3} Elo`,
      total: b4.count,
      wins: b4.wins,
      winPct: safePct(b4.wins, b4.count),
    },
    {
      bracket: `${q2} - ${q3}`,
      label: `${q2} - ${q3} Elo`,
      total: b3.count,
      wins: b3.wins,
      winPct: safePct(b3.wins, b3.count),
    },
    {
      bracket: `${q1} - ${q2}`,
      label: `${q1} - ${q2} Elo`,
      total: b2.count,
      wins: b2.wins,
      winPct: safePct(b2.wins, b2.count),
    },
    {
      bracket: `< ${q1}`,
      label: `< ${q1} Elo`,
      total: b1.count,
      wins: b1.wins,
      winPct: safePct(b1.wins, b1.count),
    },
  ];
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getAnalyticsData = async (
  userId: string,
  query: Partial<AnalyticsQuery> = {},
): Promise<AnalyticsData> => {
  const { platform = "all", timeClass = "all", from, to } = query;
  const cacheKey = CACHE_KEYS.analytics(
    userId,
    platform,
    timeClass,
    from ?? "",
    to ?? "",
  );

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as AnalyticsData;
    }
  } catch {
    // Graceful fallback to database query if Redis is unavailable
  }

  const baseMatchQuery: Record<string, any> = { userId };

  if (timeClass && timeClass !== "all") {
    baseMatchQuery["time.timeClass"] = timeClass;
  }

  if (from || to) {
    baseMatchQuery.playedAt = {};
    if (from) {
      baseMatchQuery.playedAt.$gte = new Date(from);
    }
    if (to) {
      baseMatchQuery.playedAt.$lte = new Date(to);
    }
  }

  const matchQuery: Record<string, any> = { ...baseMatchQuery };
  if (platform && platform !== "all") {
    matchQuery.platform = platform;
  }

  const [facetResults, platformCountRows] = await Promise.all([
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
                medianMoves: {
                  $percentile: {
                    input: "$moves.count",
                    p: [0.5],
                    method: "approximate",
                  },
                },
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

          archiveDates: [
            {
              $group: {
                _id: null,
                firstGameAt: { $min: "$playedAt" },
                lastGameAt: { $max: "$playedAt" },
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
                "opening.name": { $exists: true, $ne: null, $nin: ["", "Undefined", "undefined"] },
              },
            },
            {
              $group: {
                _id: {
                  name: "$opening.name",
                  color: "$userPlayedAs",
                },
                eco: { $first: "$opening.eco" },
                total: { $sum: 1 },
                wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
                losses: { $sum: { $cond: [{ $eq: ["$userResult", "loss"] }, 1, 0] } },
                draws: { $sum: { $cond: [{ $eq: ["$userResult", "draw"] }, 1, 0] } },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 100 },
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
                opponentRating: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$blackPlayer.rating",
                    "$whitePlayer.rating",
                  ],
                },
                platform: 1,
                playedAt: 1,
                userResult: 1,
              },
            },
            {
              $group: {
                _id: { $toLower: "$opponent" },
                username: { $first: "$opponent" },
                rating: { $first: "$opponentRating" },
                platform: { $first: "$platform" },
                lastPlayedAt: { $max: "$playedAt" },
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
                boundaries: [0, 21, 41, 61, 81, 1000],
                default: "other",
                output: {
                  count: { $sum: 1 },
                  wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
                },
              },
            },
          ],

          quickestWin: [
            {
              $match: {
                userResult: "win",
                "moves.count": { $exists: true, $gt: 0 },
              },
            },
            {
              $project: {
                _id: 1,
                movesCount: "$moves.count",
                plies: "$moves.plies",
                termination: 1,
                playedAt: 1,
                opponentUsername: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$blackPlayer.username",
                    "$whitePlayer.username",
                  ],
                },
                opponentRating: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$blackPlayer.rating",
                    "$whitePlayer.rating",
                  ],
                },
              },
            },
            { $sort: { movesCount: 1 } },
            { $limit: 1 },
          ],

          longestGame: [
            {
              $match: {
                "moves.count": { $exists: true, $gt: 0 },
              },
            },
            {
              $project: {
                _id: 1,
                movesCount: "$moves.count",
                plies: "$moves.plies",
                termination: 1,
                playedAt: 1,
                opponentUsername: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$blackPlayer.username",
                    "$whitePlayer.username",
                  ],
                },
                opponentRating: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$blackPlayer.rating",
                    "$whitePlayer.rating",
                  ],
                },
              },
            },
            { $sort: { movesCount: -1 } },
            { $limit: 1 },
          ],

          ratingBrackets: [
            {
              $project: {
                _id: 0,
                platform: 1,
                userResult: 1,
                oppRating: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$blackPlayer.rating",
                    "$whitePlayer.rating",
                  ],
                },
              },
            },
            {
              $match: {
                oppRating: { $exists: true, $gt: 0 },
              },
            },
          ],

          ratingProgression: [
            {
              $project: {
                platform: 1,
                userRating: {
                  $cond: [
                    { $eq: ["$userPlayedAs", "white"] },
                    "$whitePlayer.rating",
                    "$blackPlayer.rating",
                  ],
                },
                playedAt: 1,
              },
            },
            {
              $match: {
                userRating: { $exists: true, $gt: 0 },
              },
            },
            {
              $group: {
                _id: {
                  platform: "$platform",
                  year: { $year: "$playedAt" },
                  month: { $month: "$playedAt" },
                },
                avgRating: { $avg: "$userRating" },
                gamesPlayed: { $sum: 1 },
              },
            },
            { $sort: { "_id.platform": 1, "_id.year": 1, "_id.month": 1 } },
          ],

          streakGames: [
            { $sort: { playedAt: 1 } },
            { $project: { _id: 0, userResult: 1 } },
          ],

          optimalWindow: [
            {
              $project: {
                userResult: 1,
                dayOfWeek: { $dayOfWeek: "$playedAt" },
                hour: { $hour: "$playedAt" },
              },
            },
            {
              $group: {
                _id: {
                  dayOfWeek: "$dayOfWeek",
                  hourSlot: {
                    $switch: {
                      branches: [
                        { case: { $and: [{ $gte: ["$hour", 6] }, { $lt: ["$hour", 12] }] }, then: "Morning (6am-12pm)" },
                        { case: { $and: [{ $gte: ["$hour", 12] }, { $lt: ["$hour", 18] }] }, then: "Afternoon (12pm-6pm)" },
                        { case: { $and: [{ $gte: ["$hour", 18] }, { $lt: ["$hour", 23] }] }, then: "Evening (6pm-11pm)" },
                      ],
                      default: "Late Night (11pm-6am)",
                    },
                  },
                },
                total: { $sum: 1 },
                wins: { $sum: { $cond: [{ $eq: ["$userResult", "win"] }, 1, 0] } },
              },
            },
            { $sort: { total: -1 } },
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
    platform && platform !== "all"
      ? Games.aggregate([
          { $match: baseMatchQuery },
          { $group: { _id: "$platform", count: { $sum: 1 } } },
        ])
      : Promise.resolve(null),
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
  const winPct = safePct(ov.wins, totalGames);
  const drawPct = safePct(ov.draws, totalGames);
  const lossPct = safePct(ov.losses, totalGames);
  const practicalOutcomeIndex = Number((winPct + drawPct / 2).toFixed(1));

  const overview = {
    totalGames,
    wins: ov.wins || 0,
    losses: ov.losses || 0,
    draws: ov.draws || 0,
    winPct,
    lossPct,
    drawPct,
    avgMoves: ov.avgMoves ? Math.round(ov.avgMoves) : 0,
    practicalOutcomeIndex,
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

  // 2. Archive span
  const archDates = raw.archiveDates?.[0];
  const firstDate = archDates?.firstGameAt ? new Date(archDates.firstGameAt) : null;
  const lastDate = archDates?.lastGameAt ? new Date(archDates.lastGameAt) : null;

  const archiveSpan: AnalyticsArchiveSpan = {
    firstGameAt: firstDate ? firstDate.toISOString() : null,
    lastGameAt: lastDate ? lastDate.toISOString() : null,
    formattedSpan: formatSpan(firstDate, lastDate),
  };

  // 3. By platform
  const byPlatform: AnalyticsPlatformStat[] = (raw.byPlatform || []).map((p: any) => ({
    platform: p._id as PlatformType,
    total: p.total,
    wins: p.wins,
    losses: p.losses,
    draws: p.draws,
    winPct: safePct(p.wins, p.total),
  }));

  // 4. By time class
  const byTimeClass: AnalyticsTimeClassStat[] = (raw.byTimeClass || []).map((t: any) => ({
    timeClass: t._id as TimeClassType,
    total: t.total,
    wins: t.wins,
    losses: t.losses,
    draws: t.draws,
    winPct: safePct(t.wins, t.total),
    volumePct: safePct(t.total, totalGames),
  }));

  // 5. Openings breakdown
  const openingsAsWhite: AnalyticsOpeningStat[] = [];
  const openingsAsBlack: AnalyticsOpeningStat[] = [];

  for (const op of raw.byOpening || []) {
    const stat: AnalyticsOpeningStat = {
      name: op._id.name,
      eco: op.eco || op._id.eco,
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

  // Volume threshold for signature weapons and vulnerabilities:
  // at least 15 games in large archives, or 3% of total games (minimum 5 games for small vaults)
  const weaponThreshold = Math.max(5, Math.min(15, Math.round(totalGames * 0.03)));

  const allOpenings = [...openingsAsWhite, ...openingsAsBlack];
  const eligibleSignature = allOpenings
    .filter((o) => o.total >= weaponThreshold)
    .sort((a, b) => b.winPct - a.winPct || b.total - a.total);
  const signatureWeapons = eligibleSignature.slice(0, 3);
  const signatureWeapon = signatureWeapons.length > 0 ? signatureWeapons[0] : null;

  const eligibleVulnerable = allOpenings
    .filter((o) => o.total >= weaponThreshold && o.winPct < 50)
    .sort((a, b) => a.winPct - b.winPct || b.total - a.total);
  const vulnerableOpenings = eligibleVulnerable.slice(0, 3);
  const vulnerableOpening = vulnerableOpenings.length > 0 ? vulnerableOpenings[0] : null;

  const openings = {
    asWhite: openingsAsWhite.slice(0, 20),
    asBlack: openingsAsBlack.slice(0, 20),
    signatureWeapons,
    vulnerableOpenings,
    signatureWeapon,
    vulnerableOpening,
  };

  // 6. Opponents breakdown
  const totalUnique = raw.uniqueOpponents?.[0]?.count || 0;
  const topRivals: AnalyticsOpponentStat[] = (raw.topOpponents || [])
    .map((o: any) => ({
      username: o.username || o._id,
      rating: o.rating,
      platform: o.platform,
      lastPlayedAt: o.lastPlayedAt,
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

  // 7. Terminations breakdown
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

  // 8. Move count 5 buckets
  const bucketMap: Record<number | string, { count: number; wins: number }> = {};
  for (const b of raw.moveBuckets || []) {
    bucketMap[b._id] = { count: b.count, wins: b.wins };
  }

  const b0_20 = bucketMap[0] || { count: 0, wins: 0 };
  const b21_40 = bucketMap[21] || { count: 0, wins: 0 };
  const b41_60 = bucketMap[41] || { count: 0, wins: 0 };
  const b61_80 = bucketMap[61] || { count: 0, wins: 0 };
  const b81_plus = bucketMap[81] || { count: 0, wins: 0 };

  const moveBuckets: AnalyticsMoveBucket[] = [
    {
      bucket: "0-20",
      label: "0-20 moves",
      count: b0_20.count,
      wins: b0_20.wins,
      winPct: safePct(b0_20.wins, b0_20.count),
      percentage: safePct(b0_20.count, totalGames),
    },
    {
      bucket: "21-40",
      label: "21-40 moves",
      count: b21_40.count,
      wins: b21_40.wins,
      winPct: safePct(b21_40.wins, b21_40.count),
      percentage: safePct(b21_40.count, totalGames),
    },
    {
      bucket: "41-60",
      label: "41-60 moves",
      count: b41_60.count,
      wins: b41_60.wins,
      winPct: safePct(b41_60.wins, b41_60.count),
      percentage: safePct(b41_60.count, totalGames),
    },
    {
      bucket: "61-80",
      label: "61-80 moves",
      count: b61_80.count,
      wins: b61_80.wins,
      winPct: safePct(b61_80.wins, b61_80.count),
      percentage: safePct(b61_80.count, totalGames),
    },
    {
      bucket: "81+",
      label: "81+ moves",
      count: b81_plus.count,
      wins: b81_plus.wins,
      winPct: safePct(b81_plus.wins, b81_plus.count),
      percentage: safePct(b81_plus.count, totalGames),
    },
  ];

  // 9. Game length highlights
  const qWinRaw = raw.quickestWin?.[0];
  const quickestWin: AnalyticsGameHighlight | null = qWinRaw
    ? {
        gameId: qWinRaw._id.toString(),
        opponentUsername: qWinRaw.opponentUsername,
        opponentRating: qWinRaw.opponentRating,
        movesCount: qWinRaw.movesCount,
        plies: qWinRaw.plies,
        termination: qWinRaw.termination,
        playedAt: qWinRaw.playedAt,
      }
    : null;

  const lGameRaw = raw.longestGame?.[0];
  const longestGame: AnalyticsGameHighlight | null = lGameRaw
    ? {
        gameId: lGameRaw._id.toString(),
        opponentUsername: lGameRaw.opponentUsername,
        opponentRating: lGameRaw.opponentRating,
        movesCount: lGameRaw.movesCount,
        plies: lGameRaw.plies,
        termination: lGameRaw.termination,
        playedAt: lGameRaw.playedAt,
      }
    : null;

  const medianMoves =
    Array.isArray(ov.medianMoves) && ov.medianMoves.length > 0
      ? Math.round(ov.medianMoves[0])
      : typeof ov.medianMoves === "number"
      ? Math.round(ov.medianMoves)
      : ov.avgMoves
      ? Math.round(ov.avgMoves)
      : 0;

  const gameLength: AnalyticsGameLength = {
    meanMoves: overview.avgMoves,
    medianMoves,
    quickestWin,
    longestGame,
  };

  // 10. Rating brackets (per-platform dynamic quartiles)
  const rawBrackets = (raw.ratingBrackets || []) as {
    platform?: PlatformType;
    oppRating: number;
    userResult: "win" | "loss" | "draw";
  }[];

  const bracketPlatforms: PlatformType[] =
    platform !== "all"
      ? [platform as PlatformType]
      : Array.from(
          new Set([
            ...byPlatform.map((bp) => bp.platform),
            ...rawBrackets.map((b) => b.platform).filter(Boolean) as PlatformType[],
          ])
        );

  const ratingBrackets: AnalyticsPlatformRatingBrackets[] = bracketPlatforms.map((platform) => {
    const platformRaw = rawBrackets.filter(
      (b) => (b.platform || platform) === platform
    );
    return {
      platform,
      brackets: computeRatingBrackets(platformRaw),
    };
  });

  // 11. Optimal Window
  const windowThreshold = Math.max(3, Math.round(totalGames * 0.05));
  let optimalWindow: AnalyticsOptimalWindow | null = null;
  const eligibleWindows = (raw.optimalWindow || [])
    .map((w: any) => ({
      dayOfWeek: DAY_NAMES[w._id.dayOfWeek - 1] || "Sunday",
      timeSlot: w._id.hourSlot,
      gamesCount: w.total,
      winPct: safePct(w.wins, w.total),
    }))
    .filter((w: any) => w.gamesCount >= windowThreshold)
    .sort((a: any, b: any) => b.winPct - a.winPct || b.gamesCount - a.gamesCount);

  if (eligibleWindows.length > 0) {
    optimalWindow = eligibleWindows[0];
  }

  // 12. Activity trends
  const activityTrends: AnalyticsActivityTrend[] = (raw.activityTrends || []).map((a: any) => {
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

  // 13. Rating progression (per-platform)
  const progressionPlatforms: PlatformType[] =
    platform !== "all"
      ? [platform as PlatformType]
      : Array.from(
          new Set([
            ...byPlatform.map((bp) => bp.platform),
            ...(raw.ratingProgression || [])
              .map((rp: any) => rp._id?.platform as PlatformType)
              .filter(Boolean),
          ])
        );

  const ratingProgression: AnalyticsPlatformRatingProgression[] = progressionPlatforms.map(
    (platform) => {
      const platformPoints: AnalyticsRatingPoint[] = (raw.ratingProgression || [])
        .filter((rp: any) => (rp._id?.platform || platform) === platform)
        .map((rp: any) => {
          const yearStr = String(rp._id.year);
          const monthStr = String(rp._id.month).padStart(2, "0");
          return {
            period: `${yearStr}-${monthStr}`,
            avgRating: Math.round(rp.avgRating),
            gamesPlayed: rp.gamesPlayed,
          };
        });

      return {
        platform,
        data: platformPoints,
      };
    }
  );

  // 14. Streaks
  let longestWinStreak = 0;
  let runningWinStreak = 0;
  let longestLossStreak = 0;
  let runningLossStreak = 0;
  let longestDrawStreak = 0;
  let runningDrawStreak = 0;
  let currentStreakCount = 0;
  let currentStreakType: "win" | "loss" | "draw" | "none" = "none";

  for (const g of raw.streakGames || []) {
    const res = g.userResult;
    if (res === "win") {
      runningWinStreak += 1;
      runningLossStreak = 0;
      runningDrawStreak = 0;
    } else if (res === "loss") {
      runningLossStreak += 1;
      runningWinStreak = 0;
      runningDrawStreak = 0;
    } else if (res === "draw") {
      runningDrawStreak += 1;
      runningWinStreak = 0;
      runningLossStreak = 0;
    } else {
      runningWinStreak = 0;
      runningLossStreak = 0;
      runningDrawStreak = 0;
    }

    if (runningWinStreak > longestWinStreak) longestWinStreak = runningWinStreak;
    if (runningLossStreak > longestLossStreak) longestLossStreak = runningLossStreak;
    if (runningDrawStreak > longestDrawStreak) longestDrawStreak = runningDrawStreak;

    if (currentStreakType === "none" || currentStreakType === res) {
      currentStreakType = res as "win" | "loss" | "draw";
      currentStreakCount += 1;
    } else {
      currentStreakType = res as "win" | "loss" | "draw";
      currentStreakCount = 1;
    }
  }

  const streaks: AnalyticsStreaks = {
    currentStreak: {
      count: currentStreakCount,
      type: currentStreakType,
    },
    longestWinStreak,
    longestLossStreak,
    longestDrawStreak,
  };

  const platformCounts = {
    all: 0,
    "chess.com": 0,
    lichess: 0,
  };

  if (platformCountRows) {
    for (const row of platformCountRows as Array<{ _id: PlatformType; count: number }>) {
      if (row._id === "chess.com" || row._id === "lichess") {
        platformCounts[row._id] = row.count;
      }
    }
    platformCounts.all = platformCounts["chess.com"] + platformCounts.lichess;
  } else {
    for (const bp of byPlatform) {
      if (bp.platform === "chess.com" || bp.platform === "lichess") {
        platformCounts[bp.platform] = bp.total;
      }
    }
    platformCounts.all = overview.totalGames;
  }

  const result: AnalyticsData = {
    query: {
      platform: (platform as PlatformType) || "all",
      timeClass: (timeClass as TimeClassType) || "all",
      from,
      to,
    },
    overview,
    archiveSpan,
    platformCounts,
    byPlatform,
    byTimeClass,
    openings,
    opponents,
    terminations,
    moveBuckets,
    gameLength,
    ratingBrackets,
    optimalWindow,
    activityTrends,
    ratingProgression,
    streaks,
  };

  try {
    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      CACHE_TTL.ANALYTICS_24H,
    );
  } catch {
    // Ignore Redis write errors
  }

  return result;
};
