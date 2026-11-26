import { describe, it, expect, vi, beforeEach } from "vitest";
import { UNKNOWN_OPENING_NAME } from "@chess-vault/shared";
import {
  normalizeChessComGame,
  normalizeLichessGame,
  buildOpeningMetadata,
} from "../../src/Helpers";
import Games from "../../src/DB/Models/games.model";
import {
  MOCK_LICHESS_GAME,
  MOCK_LICHESS_GAME_NO_OPENING,
  MOCK_LICHESS_GAME_NO_VARIATION,
} from "../fixtures/lichess_game.fixture";
import {
  MOCK_CHESS_COM_GAME_ECO_ONLY,
  MOCK_CHESS_COM_GAME_NO_OPENING,
} from "../fixtures/chess_com_game.fixture";

describe("Opening Metadata Resilience & Normalization", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("1. produces full opening object when name, eco, and variation are present", () => {
    const normalized = normalizeLichessGame({
      game: MOCK_LICHESS_GAME,
      userId: "user_123",
      username: "Sultan2403",
    });

    expect(normalized.opening).toEqual({
      name: "Caro-Kann Defense",
      eco: "B10",
      variation: "Two Knights Attack",
    });
  });

  it("2. omits eco when opening has a known name and variation but missing eco", () => {
    const opening = buildOpeningMetadata({
      name: "Sicilian Defense",
      variation: "Open Sicilian",
      eco: undefined,
    });

    expect(opening).toEqual({
      name: "Sicilian Defense",
      variation: "Open Sicilian",
    });
    expect("eco" in opening).toBe(false);
  });

  it("3. omits variation when opening has a known name and eco but missing variation", () => {
    const normalized = normalizeLichessGame({
      game: MOCK_LICHESS_GAME_NO_VARIATION,
      userId: "user_123",
      username: "Sultan2403",
    });

    expect(normalized.opening).toEqual({
      name: "Sicilian Defense",
      eco: "B20",
    });
    expect("variation" in normalized.opening!).toBe(false);
  });

  it("4 & 5. falls back to UNKNOWN_OPENING_NAME without throwing when Lichess opening is missing", () => {
    expect(() =>
      normalizeLichessGame({
        game: MOCK_LICHESS_GAME_NO_OPENING,
        userId: "user_123",
        username: "Sultan2403",
      }),
    ).not.toThrow();

    const normalized = normalizeLichessGame({
      game: MOCK_LICHESS_GAME_NO_OPENING,
      userId: "user_123",
      username: "Sultan2403",
    });

    expect(normalized.opening).toEqual({
      name: UNKNOWN_OPENING_NAME,
    });
    expect("eco" in normalized.opening!).toBe(false);
    expect("variation" in normalized.opening!).toBe(false);
  });

  it("4 & 5. falls back to UNKNOWN_OPENING_NAME without throwing when Chess.com PGN has no opening headers", () => {
    expect(() =>
      normalizeChessComGame({
        game: MOCK_CHESS_COM_GAME_NO_OPENING,
        userId: "user_123",
        username: "Sultan2403",
      }),
    ).not.toThrow();

    const normalized = normalizeChessComGame({
      game: MOCK_CHESS_COM_GAME_NO_OPENING,
      userId: "user_123",
      username: "Sultan2403",
    });

    expect(normalized.opening).toEqual({
      name: UNKNOWN_OPENING_NAME,
    });
    expect("eco" in normalized.opening!).toBe(false);
    expect("variation" in normalized.opening!).toBe(false);
  });

  it("preserves ECO when opening name cannot be derived", () => {
    const normalized = normalizeChessComGame({
      game: MOCK_CHESS_COM_GAME_ECO_ONLY,
      userId: "user_123",
      username: "Sultan2403",
    });

    expect(normalized.opening).toEqual({
      name: UNKNOWN_OPENING_NAME,
      eco: "B20",
    });
    expect("variation" in normalized.opening!).toBe(false);
  });

  it("6. allows persisting a game with UNKNOWN_OPENING_NAME under Mongoose Games schema", async () => {
    const normalized = normalizeLichessGame({
      game: MOCK_LICHESS_GAME_NO_OPENING,
      userId: "user_123",
      username: "Sultan2403",
    });

    const doc = new Games(normalized);
    await expect(doc.validate()).resolves.toBeUndefined();
    expect(doc.opening?.name).toBe(UNKNOWN_OPENING_NAME);
  });
});
