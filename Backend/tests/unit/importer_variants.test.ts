import { describe, it, expect, vi, beforeEach } from "vitest";
import { importGames } from "../../src/Services/games.service";
import chessComApi from "../../src/Api/chess_com.api";
import lichessApi from "../../src/Api/lichess.api";
import Games from "../../src/DB/Models/games.model";
import { Readable } from "stream";
import { MOCK_CHESS_COM_GAME } from "../fixtures/chess_com_game.fixture";
import { MOCK_LICHESS_GAME } from "../fixtures/lichess_game.fixture";

describe("Importer Variant Filtering", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Chess.com variant filtering", () => {
    it("should accept standard chess games and threecheck games", async () => {
      const standardGame = {
        ...MOCK_CHESS_COM_GAME,
        rules: "chess",
        uuid: "chess-std-1",
      };
      const threeCheckGame = {
        ...MOCK_CHESS_COM_GAME,
        rules: "threecheck",
        uuid: "chess-tc-1",
      };

      vi.spyOn(chessComApi, "getPlayerArchives").mockResolvedValue({
        archives: ["https://api.chess.com/pub/player/mada1974/games/2026/01"],
      });

      vi.spyOn(chessComApi, "getGamesFromArchiveUrl").mockResolvedValue({
        games: [standardGame, threeCheckGame] as any,
      });

      const bulkWriteSpy = vi.spyOn(Games, "bulkWrite").mockResolvedValue({
        upsertedCount: 2,
        matchedCount: 0,
      } as any);

      const result = await importGames({
        userId: "user_123",
        username: "mada1974",
        platform: "chess.com",
      });

      expect(result.success).toBe(true);
      expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
      const ops = bulkWriteSpy.mock.calls[0][0] as any[];
      expect(ops.length).toBe(2);
      expect(ops[0].updateOne.filter.platformGameId).toBe("chess-tc-1");
      expect(ops[1].updateOne.filter.platformGameId).toBe("chess-std-1");
    });

    it("should reject and skip non-standard variants (bughouse, crazyhouse, etc.)", async () => {
      const bughouseGame = {
        ...MOCK_CHESS_COM_GAME,
        rules: "bughouse",
        uuid: "chess-bughouse-1",
      };
      const crazyhouseGame = {
        ...MOCK_CHESS_COM_GAME,
        rules: "crazyhouse",
        uuid: "chess-crazyhouse-1",
      };
      const standardGame = {
        ...MOCK_CHESS_COM_GAME,
        rules: "chess",
        uuid: "chess-std-2",
      };

      vi.spyOn(chessComApi, "getPlayerArchives").mockResolvedValue({
        archives: ["https://api.chess.com/pub/player/mada1974/games/2026/01"],
      });

      vi.spyOn(chessComApi, "getGamesFromArchiveUrl").mockResolvedValue({
        games: [bughouseGame, crazyhouseGame, standardGame] as any,
      });

      const bulkWriteSpy = vi.spyOn(Games, "bulkWrite").mockResolvedValue({
        upsertedCount: 1,
        matchedCount: 0,
      } as any);

      const result = await importGames({
        userId: "user_123",
        username: "mada1974",
        platform: "chess.com",
      });

      expect(result.success).toBe(true);
      expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
      const ops = bulkWriteSpy.mock.calls[0][0] as any[];
      expect(ops.length).toBe(1);
      expect(ops[0].updateOne.filter.platformGameId).toBe("chess-std-2");
    });
  });

  describe("Lichess variant filtering", () => {
    it("should accept standard and threeCheck variants and skip unsupported variants like atomic and horde", async () => {
      const standardGame = {
        ...MOCK_LICHESS_GAME,
        id: "lichess-std-1",
        variant: "standard",
      };
      const threeCheckGame = {
        ...MOCK_LICHESS_GAME,
        id: "lichess-tc-1",
        variant: "threeCheck",
      };
      const atomicGame = {
        ...MOCK_LICHESS_GAME,
        id: "lichess-atomic-1",
        variant: "atomic",
      };
      const hordeGame = {
        ...MOCK_LICHESS_GAME,
        id: "lichess-horde-1",
        variant: "horde",
      };

      const ndjsonContent = [
        JSON.stringify(standardGame),
        JSON.stringify(atomicGame),
        JSON.stringify(threeCheckGame),
        JSON.stringify(hordeGame),
      ].join("\n");

      const mockStream = Readable.from([ndjsonContent]);

      vi.spyOn(lichessApi, "getUserGames").mockResolvedValue(mockStream as any);

      const bulkWriteSpy = vi.spyOn(Games, "bulkWrite").mockResolvedValue({
        upsertedCount: 2,
        matchedCount: 0,
      } as any);

      const result = await importGames({
        userId: "user_123",
        username: "sultan2403",
        platform: "lichess",
      });

      expect(result.success).toBe(true);
      expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
      const ops = bulkWriteSpy.mock.calls[0][0] as any[];
      expect(ops.length).toBe(2);
      expect(ops[0].updateOne.filter.platformGameId).toBe("lichess-std-1");
      expect(ops[1].updateOne.filter.platformGameId).toBe("lichess-tc-1");
    });
  });
});
