import { describe, it, expect } from "vitest";
import {
  parseClockStringToMs,
  parsePgnClocks,
  normalizeLichessClocks,
  parseChessComTimeControl,
} from "../../src/Utils";
import { normalizeChessComGame, normalizeLichessGame } from "../../src/Helpers";
import { MOCK_CHESS_COM_GAME } from "../fixtures/chess_com_game.fixture";
import { MOCK_LICHESS_GAME } from "../fixtures/lichess_game.fixture";

describe("Game Clock Pipeline & Canonical GameTime", () => {
  describe("parseClockStringToMs", () => {
    it("should parse whole-second clocks in H:MM:SS format", () => {
      expect(parseClockStringToMs("0:05:00")).toBe(300000);
      expect(parseClockStringToMs("1:00:00")).toBe(3600000);
      expect(parseClockStringToMs("0:01:30")).toBe(90000);
      expect(parseClockStringToMs("2:15:45")).toBe(8145000);
    });

    it("should parse whole-second clocks in MM:SS format", () => {
      expect(parseClockStringToMs("05:00")).toBe(300000);
      expect(parseClockStringToMs("10:00")).toBe(600000);
      expect(parseClockStringToMs("01:30")).toBe(90000);
    });

    it("should parse fractional-second clocks with exact precision", () => {
      // 0:00:28.8 -> 28.8 seconds = 28800 ms
      expect(parseClockStringToMs("0:00:28.8")).toBe(28800);
      // 0:00:00.1 -> 0.1 seconds = 100 ms
      expect(parseClockStringToMs("0:00:00.1")).toBe(100);
      // 0:00:00.05 -> 0.05 seconds = 50 ms
      expect(parseClockStringToMs("0:00:00.05")).toBe(50);
      // 0:00:00.001 -> 0.001 seconds = 1 ms
      expect(parseClockStringToMs("0:00:00.001")).toBe(1);
      // 1:15:30.5 -> 1h 15m 30.5s = 4530500 ms
      expect(parseClockStringToMs("1:15:30.5")).toBe(4530500);
      // 0:03:15.854 -> 3m 15.854s = 195854 ms
      expect(parseClockStringToMs("0:03:15.854")).toBe(195854);
    });

    it("should handle zero remaining time correctly", () => {
      expect(parseClockStringToMs("0:00:00")).toBe(0);
      expect(parseClockStringToMs("0:00:00.0")).toBe(0);
      expect(parseClockStringToMs("00:00")).toBe(0);
    });

    it("should return undefined for malformed or missing clock inputs", () => {
      expect(parseClockStringToMs("")).toBeUndefined();
      expect(parseClockStringToMs("invalid")).toBeUndefined();
      expect(parseClockStringToMs("0:xx:00")).toBeUndefined();
      expect(parseClockStringToMs("-1:00:00")).toBeUndefined();
      expect(parseClockStringToMs("0:00:-5")).toBeUndefined();
      expect(parseClockStringToMs(null as any)).toBeUndefined();
      expect(parseClockStringToMs(undefined as any)).toBeUndefined();
    });
  });

  describe("parseChessComTimeControl", () => {
    it("should parse live time control without increment", () => {
      expect(parseChessComTimeControl("180")).toEqual({
        initial: 180000,
        increment: 0,
      });
      expect(parseChessComTimeControl("600")).toEqual({
        initial: 600000,
        increment: 0,
      });
    });

    it("should parse live time control with increment", () => {
      expect(parseChessComTimeControl("180+2")).toEqual({
        initial: 180000,
        increment: 2000,
      });
      expect(parseChessComTimeControl("600+5")).toEqual({
        initial: 600000,
        increment: 5000,
      });
    });

    it("should parse daily time controls in 1/<seconds> format (1, 2, 3, 5, 7, 14 days)", () => {
      // 1 day = 86400s
      expect(parseChessComTimeControl("1/86400")).toEqual({ daysPerTurn: 1 });
      // 2 days = 172800s
      expect(parseChessComTimeControl("1/172800")).toEqual({ daysPerTurn: 2 });
      // 3 days = 259200s
      expect(parseChessComTimeControl("1/259200")).toEqual({ daysPerTurn: 3 });
      // 5 days = 432000s
      expect(parseChessComTimeControl("1/432000")).toEqual({ daysPerTurn: 5 });
      // 7 days = 604800s
      expect(parseChessComTimeControl("1/604800")).toEqual({ daysPerTurn: 7 });
      // 14 days = 1209600s
      expect(parseChessComTimeControl("1/1209600")).toEqual({ daysPerTurn: 14 });
    });

    it("should safely return empty object for invalid or missing inputs", () => {
      expect(parseChessComTimeControl("")).toEqual({});
      expect(parseChessComTimeControl(undefined)).toEqual({});
      expect(parseChessComTimeControl(null)).toEqual({});
      expect(parseChessComTimeControl("custom-unparsed")).toEqual({});
    });
  });

  describe("parsePgnClocks", () => {
    it("should extract multiple %clk annotations in ply order", () => {
      const pgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.01"]

1. e4 {[%clk 0:03:00]} 1... c5 {[%clk 0:02:58.8]} 2. Nf3 {[%clk 0:02:57.2]} 2... d6 {[%clk 0:02:55]} 1-0`;

      const clocks = parsePgnClocks(pgn);
      expect(clocks).toEqual([180000, 178800, 177200, 175000]);
    });

    it("should extract clocks when other annotations (%eval, %emt) are present in comments", () => {
      const pgn = `1. d4 {[%eval +0.15] [%clk 0:10:00]} 1... d5 {[%clk 0:09:58.5] [%emt 0:00:01.5]} 2. c4 {[%clk 0:09:57]}`;
      const clocks = parsePgnClocks(pgn);
      expect(clocks).toEqual([600000, 598500, 597000]);
    });

    it("should ignore clock annotations inside parenthesized variations", () => {
      const pgn = `1. e4 {[%clk 0:05:00]} (1. d4 {[%clk 0:04:30]} 1... d5 {[%clk 0:04:20]}) 1... e5 {[%clk 0:04:58]} 2. Nf3 {[%clk 0:04:55]}`;
      const clocks = parsePgnClocks(pgn);
      expect(clocks).toEqual([300000, 298000, 295000]);
    });

    it("should handle nested variations and retain only mainline clocks", () => {
      const pgn = `1. e4 {[%clk 0:05:00]} (1. d4 (1. c4 {[%clk 0:01:00]}) {[%clk 0:04:30]}) 1... e5 {[%clk 0:04:58]}`;
      const clocks = parsePgnClocks(pgn);
      expect(clocks).toEqual([300000, 298000]);
    });

    it("should return undefined when no clock annotations are present", () => {
      const pgn = `1. e4 e5 2. Nf3 Nc6 1-0`;
      expect(parsePgnClocks(pgn)).toBeUndefined();
      expect(parsePgnClocks("")).toBeUndefined();
      expect(parsePgnClocks(null)).toBeUndefined();
    });
  });

  describe("normalizeLichessClocks", () => {
    it("should convert centiseconds array to integer milliseconds", () => {
      // 60000 cs = 600000 ms (10 min), 59820 cs = 598200 ms, 0 cs = 0 ms
      const structuredClocks = [60000, 59820, 58500, 0];
      const normalized = normalizeLichessClocks(structuredClocks);
      expect(normalized).toEqual([600000, 598200, 585000, 0]);
    });

    it("should return undefined for empty, null, or undefined array", () => {
      expect(normalizeLichessClocks([])).toBeUndefined();
      expect(normalizeLichessClocks(null)).toBeUndefined();
      expect(normalizeLichessClocks(undefined)).toBeUndefined();
    });

    it("should return undefined for malformed clock arrays containing NaN or negative numbers", () => {
      expect(normalizeLichessClocks([60000, NaN, 58000])).toBeUndefined();
      expect(normalizeLichessClocks([60000, -100, 58000])).toBeUndefined();
      expect(normalizeLichessClocks([60000, "5000" as any])).toBeUndefined();
    });
  });

  describe("End-to-End Normalization & Acceptance Criteria", () => {
    it("1. Chess.com live time control without increment", () => {
      const game = {
        ...MOCK_CHESS_COM_GAME,
        time_control: "180",
        time_class: "blitz",
      };

      const normalized = normalizeChessComGame({
        game,
        userId: "user_123",
        username: "mada1974",
      });

      expect(normalized.time).toEqual({
        timeClass: "blitz",
        initial: 180000,
        increment: 0,
      });
    });

    it("2. Chess.com live time control with increment", () => {
      const game = {
        ...MOCK_CHESS_COM_GAME,
        time_control: "180+2",
        time_class: "blitz",
      };

      const normalized = normalizeChessComGame({
        game,
        userId: "user_123",
        username: "mada1974",
      });

      expect(normalized.time).toEqual({
        timeClass: "blitz",
        initial: 180000,
        increment: 2000,
      });
    });

    it("3. Chess.com Daily conversion from 1/<seconds> (1, 2, 3, 5, 7, 14 days)", () => {
      const dailyCases = [
        { seconds: "1/86400", expectedDays: 1 },
        { seconds: "1/172800", expectedDays: 2 },
        { seconds: "1/259200", expectedDays: 3 },
        { seconds: "1/432000", expectedDays: 5 },
        { seconds: "1/604800", expectedDays: 7 },
        { seconds: "1/1209600", expectedDays: 14 },
      ];

      for (const { seconds, expectedDays } of dailyCases) {
        const game = {
          ...MOCK_CHESS_COM_GAME,
          time_control: seconds,
          time_class: "daily",
        };

        const normalized = normalizeChessComGame({
          game,
          userId: "user_123",
          username: "mada1974",
        });

        expect(normalized.time).toEqual({
          timeClass: "daily",
          daysPerTurn: expectedDays,
        });
      }
    });

    it("4. Lichess live time-control normalization", () => {
      const lichessGame = {
        ...MOCK_LICHESS_GAME,
        speed: "blitz",
        clock: {
          initial: 180,
          increment: 2,
          totalTime: 260,
        },
      };

      const normalized = normalizeLichessGame({
        game: lichessGame,
        userId: "user_123",
        username: "Sultan2403",
      });

      expect(normalized.time.timeClass).toBe("blitz");
      expect(normalized.time.initial).toBe(180000);
      expect(normalized.time.increment).toBe(2000);
      // Ensure totalTime is not stored
      expect((normalized.time as any).totalTime).toBeUndefined();
    });

    it("5. Lichess Daily/correspondence normalization when source data supports it", () => {
      const lichessCorrespondence = {
        ...MOCK_LICHESS_GAME,
        speed: "correspondence",
        clock: undefined,
        daysPerTurn: 5,
      };

      const normalized = normalizeLichessGame({
        game: lichessCorrespondence,
        userId: "user_123",
        username: "Sultan2403",
      });

      expect(normalized.time).toEqual({
        timeClass: "daily",
        daysPerTurn: 5,
      });
    });

    it("6. Clock arrays remain correctly normalized to milliseconds", () => {
      const chessComGame = {
        ...MOCK_CHESS_COM_GAME,
        time_control: "180+2",
        time_class: "blitz",
        pgn: `[Event "Live Chess"]\n[ECO "B01"]\n\n1. e4 {[%clk 0:03:00]} 1... d5 {[%clk 0:02:58.8]} 2. exd5 {[%clk 0:02:59.2]} 2... Qxd5 {[%clk 0:02:55]} 1-0`,
      };

      const normalized = normalizeChessComGame({
        game: chessComGame,
        userId: "user_123",
        username: "mada1974",
      });

      expect(normalized.time.clocks).toEqual([180000, 178800, 179200, 175000]);
    });

    it("7. Missing optional time fields are handled safely", () => {
      const noClockLichess = {
        ...MOCK_LICHESS_GAME,
        clock: undefined,
        daysPerTurn: undefined,
        clocks: undefined,
        speed: "classical",
      };

      const normalized = normalizeLichessGame({
        game: noClockLichess,
        userId: "user_123",
        username: "Sultan2403",
      });

      expect(normalized.time).toEqual({
        timeClass: "classical",
      });
    });

    it("8. Equivalent Chess.com/Lichess live time controls produce equivalent canonical GameTime objects", () => {
      // Chess.com 3+2 game
      const chessComGame = {
        ...MOCK_CHESS_COM_GAME,
        time_class: "blitz",
        time_control: "180+2",
        pgn: `1. e4 {[%clk 0:03:00]} 1... c5 {[%clk 0:02:58.8]} 2. Nf3 {[%clk 0:02:57.4]} 2... d6 {[%clk 0:02:55]} 1-0`,
      };

      // Lichess 3+2 game (structured clocks in cs: [18000, 17880, 17740, 17500])
      const lichessGame = {
        ...MOCK_LICHESS_GAME,
        speed: "blitz",
        clock: {
          initial: 180,
          increment: 2,
          totalTime: 260,
        },
        clocks: [18000, 17880, 17740, 17500],
      };

      const normalizedChessCom = normalizeChessComGame({
        game: chessComGame,
        userId: "user_123",
        username: "mada1974",
      });

      const normalizedLichess = normalizeLichessGame({
        game: lichessGame,
        userId: "user_123",
        username: "Sultan2403",
      });

      const expectedGameTime = {
        timeClass: "blitz",
        initial: 180000,
        increment: 2000,
        clocks: [180000, 178800, 177400, 175000],
      };

      expect(normalizedChessCom.time).toEqual(expectedGameTime);
      expect(normalizedLichess.time).toEqual(expectedGameTime);
      expect(normalizedChessCom.time).toEqual(normalizedLichess.time);
    });
  });
});

