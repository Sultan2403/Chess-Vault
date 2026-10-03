import { describe, it, expect } from "vitest";
import {
  parseClockStringToMs,
  parsePgnClocks,
  normalizeLichessClocks,
} from "../../src/Utils/pgn";
import { normalizeChessComGame, normalizeLichessGame } from "../../src/Helpers";
import { MOCK_CHESS_COM_GAME } from "../fixtures/chess_com_game.fixture";
import { MOCK_LICHESS_GAME } from "../fixtures/lichess_game.fixture";

describe("Game Clock Pipeline", () => {
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
    it("should normalize clocks from a Chess.com game with PGN clock annotations", () => {
      const chessComGame = {
        ...MOCK_CHESS_COM_GAME,
        pgn: `[Event "Live Chess"]\n[ECO "B01"]\n\n1. e4 {[%clk 0:03:00]} 1... d5 {[%clk 0:02:58.8]} 2. exd5 {[%clk 0:02:59.2]} 2... Qxd5 {[%clk 0:02:55]} 1-0`,
      };

      const normalized = normalizeChessComGame({
        game: chessComGame,
        userId: "user_123",
        username: "mada1974",
      });

      expect(normalized.clocks).toEqual([180000, 178800, 179200, 175000]);
    });

    it("should omit clocks when Chess.com game PGN has no clock annotations", () => {
      const chessComGame = {
        ...MOCK_CHESS_COM_GAME,
        pgn: `1. e4 d5 2. exd5 Qxd5 1-0`,
      };

      const normalized = normalizeChessComGame({
        game: chessComGame,
        userId: "user_123",
        username: "mada1974",
      });

      expect(normalized.clocks).toBeUndefined();
    });

    it("should use structured clocks as primary source for Lichess game without re-parsing PGN", () => {
      const lichessGame = {
        ...MOCK_LICHESS_GAME,
        clocks: [60000, 59820, 59500, 59200],
        pgn: `1. e4 {[%clk 0:01:00]} 1... c6 {[%clk 0:01:00]} 0-1`, // Differs from structured
      };

      const normalized = normalizeLichessGame({
        game: lichessGame,
        userId: "user_123",
        username: "Sultan2403",
      });

      // Must prefer structured data [60000, 59820, 59500, 59200] -> * 10 ms
      expect(normalized.clocks).toEqual([600000, 598200, 595000, 592000]);
    });

    it("should fallback to PGN clock parsing when Lichess structured clocks are absent or empty", () => {
      const lichessGame = {
        ...MOCK_LICHESS_GAME,
        clocks: undefined,
        pgn: `1. e4 {[%clk 0:10:00]} 1... c6 {[%clk 0:09:58.2]} 2. Bc4 {[%clk 0:09:55]} 0-1`,
      };

      const normalized = normalizeLichessGame({
        game: lichessGame,
        userId: "user_123",
        username: "Sultan2403",
      });

      expect(normalized.clocks).toEqual([600000, 598200, 595000]);
    });

    it("should produce the same canonical representation for equivalent Chess.com and Lichess games", () => {
      // Chess.com source (via PGN annotations)
      const chessComGame = {
        ...MOCK_CHESS_COM_GAME,
        pgn: `1. e4 {[%clk 0:05:00]} 1... c5 {[%clk 0:04:58.8]} 2. Nf3 {[%clk 0:04:57.4]} 2... d6 {[%clk 0:04:55]} 1-0`,
      };

      // Lichess source (via structured clocks: centiseconds)
      const lichessGame = {
        ...MOCK_LICHESS_GAME,
        clocks: [30000, 29880, 29740, 29500],
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

      const expectedCanonicalClocks = [300000, 298800, 297400, 295000];

      expect(normalizedChessCom.clocks).toEqual(expectedCanonicalClocks);
      expect(normalizedLichess.clocks).toEqual(expectedCanonicalClocks);
      expect(normalizedChessCom.clocks).toEqual(normalizedLichess.clocks);
    });
  });
});
