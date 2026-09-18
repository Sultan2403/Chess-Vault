import { describe, it, expect } from "vitest";
import { normalizeChessComGame, normalizeLichessGame } from "../../src/Helpers";
import {
  MOCK_CHESS_COM_GAME,
  MOCK_CHESS_COM_DRAWN_GAME,
} from "../fixtures/chess_com_game.fixture";
import {
  MOCK_LICHESS_GAME,
  MOCK_LICHESS_DRAWN_GAME,
  MOCK_LICHESS_AI_GAME,
} from "../fixtures/lichess_game.fixture";

describe("Game Normalizers", () => {
  describe("normalizeChessComGame", () => {
    it("should correctly normalize a real Chess.com game with white winning", () => {
      const normalized = normalizeChessComGame({
        game: MOCK_CHESS_COM_GAME,
        userId: "user_123",
        folderIds: ["65f1a2b3c4d5e6f7a8b9c0d1"],
      });

      // Verify core identity and ownership
      expect(normalized.userId).toBe("user_123");
      expect(normalized.platform).toBe("chess.com");
      expect(normalized.platformGameId).toBe(MOCK_CHESS_COM_GAME.uuid);
      expect(normalized.sourceUrl).toBe(MOCK_CHESS_COM_GAME.url);
      expect(normalized.folderIds).toEqual(["65f1a2b3c4d5e6f7a8b9c0d1"]);

      // Verify player info derived directly from mock constants
      expect(normalized.whitePlayer).toEqual({
        username: MOCK_CHESS_COM_GAME.white.username,
        rating: MOCK_CHESS_COM_GAME.white.rating,
      });
      expect(normalized.blackPlayer).toEqual({
        username: MOCK_CHESS_COM_GAME.black.username,
        rating: MOCK_CHESS_COM_GAME.black.rating,
      });

      // Verify result, stats, and timestamp transformation (seconds -> ms -> Date)
      expect(normalized.result).toBe("white");
      expect(normalized.isRated).toBe(MOCK_CHESS_COM_GAME.rated);
      expect(normalized.timeClass).toBe(MOCK_CHESS_COM_GAME.time_class);
      expect(normalized.title).toBe(
        `${MOCK_CHESS_COM_GAME.white.username} vs ${MOCK_CHESS_COM_GAME.black.username}`,
      );
      expect(normalized.playedAt).toEqual(
        new Date(MOCK_CHESS_COM_GAME.end_time * 1000),
      );
    });

    it("should correctly identify a black win", () => {
      const blackWinGame = {
        ...MOCK_CHESS_COM_GAME,
        white: { ...MOCK_CHESS_COM_GAME.white, result: "checkmated" },
        black: { ...MOCK_CHESS_COM_GAME.black, result: "win" },
      };

      const normalized = normalizeChessComGame({
        game: blackWinGame,
        userId: "user_123",
      });

      expect(normalized.result).toBe("black");
    });

    it("should recognize a real drawn game by agreement ('agreed')", () => {
      const normalized = normalizeChessComGame({
        game: MOCK_CHESS_COM_DRAWN_GAME,
        userId: "user_123",
      });

      expect(normalized.result).toBe("draw");
      expect(normalized.whitePlayer.username).toBe(
        MOCK_CHESS_COM_DRAWN_GAME.white.username,
      );
      expect(normalized.blackPlayer.username).toBe(
        MOCK_CHESS_COM_DRAWN_GAME.black.username,
      );
      expect(normalized.timeClass).toBe(MOCK_CHESS_COM_DRAWN_GAME.time_class);
    });

    it("should default folderIds to null when not provided", () => {
      const normalized = normalizeChessComGame({
        game: MOCK_CHESS_COM_GAME,
        userId: "user_123",
      });

      expect(normalized.folderIds).toBeNull();
    });

    it("should parse opening details from PGN headers", () => {
      const normalized = normalizeChessComGame({
        game: MOCK_CHESS_COM_GAME,
        userId: "user_123",
      });

      expect(normalized.opening).toBeDefined();
      expect(normalized.opening?.eco).toBe("D06");
      expect(normalized.opening?.name).toBe("Queen's Gambit");
      expect(normalized.opening?.variation).toBe("Declined");
    });

    it("should omit opening when no PGN headers are present", () => {
      const noHeaderGame = {
        ...MOCK_CHESS_COM_DRAWN_GAME,
        pgn: "1. e4 e6 2. d4 1/2-1/2",
      };

      const normalized = normalizeChessComGame({
        game: noHeaderGame,
        userId: "user_123",
      });

      expect(normalized.opening).toBeUndefined();
    });
  });

  describe("normalizeLichessGame", () => {
    it("should correctly normalize a real Lichess game with a black win", () => {
      const normalized = normalizeLichessGame({
        game: MOCK_LICHESS_GAME,
        userId: "user_123",
      });

      expect(normalized.userId).toBe("user_123");
      expect(normalized.platform).toBe("lichess");
      expect(normalized.platformGameId).toBe(MOCK_LICHESS_GAME.id);
      expect(normalized.sourceUrl).toBe(`https://lichess.org/${MOCK_LICHESS_GAME.id}`);
      expect(normalized.result).toBe("black");
      expect(normalized.timeClass).toBe(MOCK_LICHESS_GAME.speed);
      expect(normalized.whitePlayer.username).toBe(
        MOCK_LICHESS_GAME.players.white.user?.name,
      );
      expect(normalized.whitePlayer.rating).toBe(
        MOCK_LICHESS_GAME.players.white.rating,
      );
      expect(normalized.blackPlayer.username).toBe(
        MOCK_LICHESS_GAME.players.black.user?.name,
      );
      expect(normalized.blackPlayer.rating).toBe(
        MOCK_LICHESS_GAME.players.black.rating,
      );
      expect(normalized.playedAt).toEqual(new Date(MOCK_LICHESS_GAME.createdAt));
    });

    it("should correctly normalize a real Lichess draw where winner is undefined", () => {
      const normalized = normalizeLichessGame({
        game: MOCK_LICHESS_DRAWN_GAME,
        userId: "user_123",
      });

      expect(normalized.result).toBe("draw");
      expect(normalized.whitePlayer.username).toBe(
        MOCK_LICHESS_DRAWN_GAME.players.white.user?.name,
      );
      expect(normalized.blackPlayer.username).toBe(
        MOCK_LICHESS_DRAWN_GAME.players.black.user?.name,
      );
    });

    it("should handle AI opponents without crashing", () => {
      const normalized = normalizeLichessGame({
        game: MOCK_LICHESS_AI_GAME,
        userId: "user_123",
      });

      expect(normalized.blackPlayer.username).toBe(
        `AI (Level ${MOCK_LICHESS_AI_GAME.players.black.aiLevel})`,
      );
      expect(normalized.blackPlayer.rating).toBe(
        MOCK_LICHESS_AI_GAME.players.black.rating,
      );
      expect(normalized.title).toBe(
        `${MOCK_LICHESS_AI_GAME.players.white.user?.name} vs AI (Level ${MOCK_LICHESS_AI_GAME.players.black.aiLevel})`,
      );
    });

    it("should handle Guest opponents when user and aiLevel are absent", () => {
      const guestGame = {
        ...MOCK_LICHESS_GAME,
        players: {
          white: {},
          black: { user: { id: "p2", name: "PlayerTwo" } },
        },
      };

      const normalized = normalizeLichessGame({
        game: guestGame as any,
        userId: "user_123",
      });

      expect(normalized.whitePlayer.username).toBe("Guest");
      expect(normalized.whitePlayer.rating).toBe(0);
    });

    it("should parse opening details from the Lichess opening object", () => {
      const normalized = normalizeLichessGame({
        game: MOCK_LICHESS_GAME,
        userId: "user_123",
      });

      expect(normalized.opening).toBeDefined();
      expect(normalized.opening?.eco).toBe("B10");
      expect(normalized.opening?.name).toBe("Caro-Kann Defense");
      expect(normalized.opening?.variation).toBe("Two Knights Attack");
    });

    it("should omit opening when no opening object is present", () => {
      const normalized = normalizeLichessGame({
        game: MOCK_LICHESS_DRAWN_GAME,
        userId: "user_123",
      });

      expect(normalized.opening).toBeUndefined();
    });
  });
});

