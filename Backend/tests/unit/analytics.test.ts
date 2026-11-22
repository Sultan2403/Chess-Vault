import { describe, it, expect, vi, beforeEach } from "vitest";
import Games from "../../src/DB/Models/games.model";
import { getAnalyticsData } from "../../src/Services/analytics.service";

describe("Analytics Service Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return empty analytics data safely with no games in vault", async () => {
    const mockFacetResult = [
      {
        overview: [],
        archiveDates: [],
        byPlatform: [],
        byTimeClass: [],
        byOpening: [],
        topOpponents: [],
        uniqueOpponents: [],
        terminations: [],
        moveBuckets: [],
        quickestWin: [],
        longestGame: [],
        ratingBrackets: [],
        optimalWindow: [],
        activityTrends: [],
        milestoneVictory: [],
      },
    ];

    vi.spyOn(Games, "aggregate").mockResolvedValue(mockFacetResult as any);
    vi.spyOn(Games, "find").mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
    } as any);

    const result = await getAnalyticsData("user_test_123");

    expect(result.overview.totalGames).toBe(0);
    expect(result.overview.winPct).toBe(0);
    expect(result.overview.lossPct).toBe(0);
    expect(result.overview.drawPct).toBe(0);
    expect(result.overview.practicalOutcomeIndex).toBe(0);
    expect(result.overview.white.winPct).toBe(0);
    expect(result.overview.black.winPct).toBe(0);
    expect(result.archiveSpan.formattedSpan).toBe("0m");
    expect(result.byPlatform).toEqual([]);
    expect(result.byTimeClass).toEqual([]);
    expect(result.openings.asWhite).toEqual([]);
    expect(result.openings.asBlack).toEqual([]);
    expect(result.openings.signatureWeapon).toBeNull();
    expect(result.openings.vulnerableOpening).toBeNull();
    expect(result.opponents.totalUnique).toBe(0);
    expect(result.opponents.topRivals).toEqual([]);
    expect(result.opponents.milestoneVictory).toBeNull();
    expect(result.moveBuckets).toHaveLength(5);
    expect(result.gameLength.quickestWin).toBeNull();
    expect(result.gameLength.longestGame).toBeNull();
    expect(result.ratingBrackets).toHaveLength(4);
    expect(result.optimalWindow).toBeNull();
    expect(result.streaks.currentStreak.count).toBe(0);
    expect(result.streaks.longestWinStreak).toBe(0);
  });

  it("should correctly aggregate overview, openings, opponents, terminations, and streaks", async () => {
    const mockFacetResult = [
      {
        overview: [
          {
            totalGames: 10,
            wins: 6,
            losses: 3,
            draws: 1,
            whiteTotal: 5,
            whiteWins: 4,
            whiteLosses: 1,
            whiteDraws: 0,
            blackTotal: 5,
            blackWins: 2,
            blackLosses: 2,
            blackDraws: 1,
            avgMoves: 34.6,
            ratedTotal: 8,
            ratedWins: 5,
          },
        ],
        archiveDates: [
          {
            firstGameAt: new Date("2023-01-01T00:00:00Z"),
            lastGameAt: new Date("2026-05-01T00:00:00Z"),
          },
        ],
        byPlatform: [
          { _id: "chess.com", total: 7, wins: 5, losses: 2, draws: 0 },
          { _id: "lichess", total: 3, wins: 1, losses: 1, draws: 1 },
        ],
        byTimeClass: [
          { _id: "blitz", total: 6, wins: 4, losses: 2, draws: 0 },
          { _id: "rapid", total: 4, wins: 2, losses: 1, draws: 1 },
        ],
        byOpening: [
          {
            _id: { name: "Sicilian Defense", eco: "B20", color: "black" },
            total: 4,
            wins: 4,
            losses: 0,
            draws: 0,
          },
          {
            _id: { name: "Italian Game", eco: "C50", color: "white" },
            total: 4,
            wins: 2,
            losses: 2,
            draws: 0,
          },
          {
            _id: { name: "French Defense", eco: "C00", color: "black" },
            total: 3,
            wins: 0,
            losses: 3,
            draws: 0,
          },
        ],
        topOpponents: [
          {
            _id: "hikaru",
            username: "Hikaru",
            rating: 2820,
            platform: "chess.com",
            total: 3,
            wins: 2,
            losses: 1,
            draws: 0,
          },
        ],
        uniqueOpponents: [{ count: 8 }],
        terminations: [
          { _id: { termination: "checkmate", userResult: "win" }, count: 3 },
          { _id: { termination: "resignation", userResult: "win" }, count: 3 },
          { _id: { termination: "timeout", userResult: "loss" }, count: 2 },
          { _id: { termination: "checkmate", userResult: "loss" }, count: 1 },
        ],
        moveBuckets: [
          { _id: 0, count: 2, wins: 2 },
          { _id: 21, count: 4, wins: 2 },
          { _id: 41, count: 2, wins: 1 },
          { _id: 61, count: 1, wins: 1 },
          { _id: 81, count: 1, wins: 0 },
        ],
        quickestWin: [
          {
            _id: "65f1a2b3c4d5e6f7a8b9c0d1",
            movesCount: 7,
            plies: 14,
            termination: "resignation",
            playedAt: new Date("2026-02-15T12:00:00Z"),
            opponentUsername: "Hikaru",
            opponentRating: 2820,
          },
        ],
        longestGame: [
          {
            _id: "65f1a2b3c4d5e6f7a8b9c0d2",
            movesCount: 109,
            plies: 217,
            termination: "checkmate",
            playedAt: new Date("2026-02-16T12:00:00Z"),
            opponentUsername: "Magnus",
            opponentRating: 2850,
          },
        ],
        ratingBrackets: [
          { _id: 0, count: 2, wins: 2 },
          { _id: 1900, count: 3, wins: 2 },
          { _id: 2100, count: 3, wins: 1 },
          { _id: 2301, count: 2, wins: 1 },
        ],
        optimalWindow: [
          {
            _id: { dayOfWeek: 1, hourSlot: "Evening (6pm-11pm)" },
            total: 4,
            wins: 3,
          },
        ],
        activityTrends: [
          {
            _id: { year: 2026, month: 1 },
            count: 4,
            wins: 3,
            losses: 1,
            draws: 0,
          },
          {
            _id: { year: 2026, month: 2 },
            count: 6,
            wins: 3,
            losses: 2,
            draws: 1,
          },
        ],
        milestoneVictory: [
          {
            _id: "65f1a2b3c4d5e6f7a8b9c0d1",
            opponentUsername: "MagnusCarlsen",
            opponentRating: 2850,
            playedAt: new Date("2026-02-15T12:00:00Z"),
            time: { timeClass: "blitz" },
            userPlayedAs: "white",
          },
        ],
      },
    ];

    const mockStreakGames = [
      { userResult: "win", playedAt: new Date("2026-01-01") },
      { userResult: "win", playedAt: new Date("2026-01-02") },
      { userResult: "win", playedAt: new Date("2026-01-03") },
      { userResult: "loss", playedAt: new Date("2026-01-04") },
      { userResult: "win", playedAt: new Date("2026-01-05") },
      { userResult: "win", playedAt: new Date("2026-01-06") },
    ];

    vi.spyOn(Games, "aggregate").mockResolvedValue(mockFacetResult as any);
    vi.spyOn(Games, "find").mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockStreakGames),
      }),
    } as any);

    const result = await getAnalyticsData("user_test_123");

    // Overview assertions
    expect(result.overview.totalGames).toBe(10);
    expect(result.overview.wins).toBe(6);
    expect(result.overview.winPct).toBe(60);
    expect(result.overview.lossPct).toBe(30);
    expect(result.overview.drawPct).toBe(10);
    expect(result.overview.practicalOutcomeIndex).toBe(65);
    expect(result.overview.avgMoves).toBe(35);
    expect(result.overview.white.winPct).toBe(80);
    expect(result.overview.black.winPct).toBe(40);
    expect(result.overview.rated.winPct).toBe(62.5);

    // Archive span
    expect(result.archiveSpan.formattedSpan).toBe("3y 4m");

    // Platform & Time Class
    expect(result.byPlatform).toHaveLength(2);
    expect(result.byPlatform[0].platform).toBe("chess.com");
    expect(result.byPlatform[0].winPct).toBe(71.4);
    expect(result.byTimeClass).toHaveLength(2);

    // Openings
    expect(result.openings.asWhite).toHaveLength(1);
    expect(result.openings.asBlack).toHaveLength(2);
    expect(result.openings.signatureWeapon?.name).toBe("Sicilian Defense");
    expect(result.openings.vulnerableOpening?.name).toBe("French Defense");

    // Opponents
    expect(result.opponents.totalUnique).toBe(8);
    expect(result.opponents.topRivals[0].username).toBe("Hikaru");
    expect(result.opponents.milestoneVictory?.opponentRating).toBe(2850);
    expect(result.opponents.milestoneVictory?.opponentUsername).toBe("MagnusCarlsen");

    // Terminations
    expect(result.terminations.winWays.checkmate).toBe(3);
    expect(result.terminations.winWays.resignation).toBe(3);
    expect(result.terminations.lossWays.timeout).toBe(2);

    // Move buckets (5 buckets)
    expect(result.moveBuckets).toHaveLength(5);
    expect(result.moveBuckets[0].count).toBe(2);
    expect(result.moveBuckets[1].count).toBe(4);

    // Game length highlights
    expect(result.gameLength.quickestWin?.movesCount).toBe(7);
    expect(result.gameLength.longestGame?.movesCount).toBe(109);

    // Rating brackets
    expect(result.ratingBrackets).toHaveLength(4);
    expect(result.ratingBrackets[0].bracket).toBe("> 2300");

    // Optimal window
    expect(result.optimalWindow?.dayOfWeek).toBe("Sunday");
    expect(result.optimalWindow?.timeSlot).toBe("Evening (6pm-11pm)");

    // Activity trends
    expect(result.activityTrends).toEqual([
      { period: "2026-01", count: 4, wins: 3, losses: 1, draws: 0, winPct: 75 },
      { period: "2026-02", count: 6, wins: 3, losses: 2, draws: 1, winPct: 50 },
    ]);

    // Streaks
    expect(result.streaks.longestWinStreak).toBe(3);
    expect(result.streaks.currentStreak).toEqual({ count: 2, type: "win" });
  });

  it("should apply query filters for platform, timeClass, and date range in aggregation match", async () => {
    let capturedMatch: any = null;

    vi.spyOn(Games, "aggregate").mockImplementation(((pipeline: any[]) => {
      capturedMatch = pipeline[0].$match;
      return Promise.resolve([{}]);
    }) as any);

    vi.spyOn(Games, "find").mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
    } as any);

    await getAnalyticsData("user_test_123", {
      platform: "chess.com",
      timeClass: "rapid",
      from: "2026-01-01T00:00:00Z",
      to: "2026-06-01T00:00:00Z",
    });

    expect(capturedMatch).toBeDefined();
    expect(capturedMatch.userId).toBe("user_test_123");
    expect(capturedMatch.platform).toBe("chess.com");
    expect(capturedMatch["time.timeClass"]).toBe("rapid");
    expect(capturedMatch.playedAt.$gte).toEqual(new Date("2026-01-01T00:00:00Z"));
    expect(capturedMatch.playedAt.$lte).toEqual(new Date("2026-06-01T00:00:00Z"));
  });
});
