import { TimeClassType } from "../Config/constants";
import {
  Chess_Com_Game,
  NormalizedGame,
  Lichess_Game,
  getPgnMoveCount,
} from "../Types/games.types";
import {
  parseLichessOpening,
  parseChessComOpening,
  parsePgnClocks,
  normalizeLichessClocks,
  parseChessComTimeControl,
} from "../Utils/pgn";

/**
 * Normalizes a raw Lichess game response into the canonical Chess Vault `NormalizedGame` model.
 *
 * Normalization details:
 * - Uses `game.speed` as the canonical `time.timeClass` (avoiding `perf`).
 * - Normalizes structured live clock parameters (`initial`, `increment`) to integer milliseconds.
 * - Captures correspondence `daysPerTurn` when provided.
 * - Extracts mainline ply clocks from structured `clocks` (or falls back to PGN annotations).
 */
export const normalizeLichessGame = ({
  game,
  userId,
  username,
  folderIds,
}: {
  game: Lichess_Game;
  userId: string;
  username: string;
  folderIds?: string[] | null;
}): NormalizedGame => {
  const sourceUrl = `https://lichess.org/${game.id}`;

  const whiteName =
    game.players.white?.user?.name ||
    (game.players.white?.aiLevel
      ? `AI (Level ${game.players.white.aiLevel})`
      : "Guest");

  const blackName =
    game.players.black?.user?.name ||
    (game.players.black?.aiLevel
      ? `AI (Level ${game.players.black.aiLevel})`
      : "Guest");

  const opening = parseLichessOpening(game.opening);
  const moves = getPgnMoveCount(game.pgn || game.moves);
  const clocks =
    normalizeLichessClocks(game.clocks) ?? parsePgnClocks(game.pgn);

  const initial =
    game.clock?.initial !== undefined
      ? Math.round(game.clock.initial * 1000)
      : undefined;
  const increment =
    game.clock !== undefined
      ? Math.round((game.clock.increment ?? 0) * 1000)
      : undefined;
  const daysPerTurn =
    typeof game.daysPerTurn === "number" && game.daysPerTurn > 0
      ? game.daysPerTurn
      : undefined;

  const userPlayedAs: "white" | "black" =
    whiteName.toLowerCase() === username.toLowerCase() ? "white" : "black";

  return {
    userId,
    userPlayedAs,
    folderIds: folderIds ?? null,
    platform: "lichess",
    platformGameId: game.id,
    sourceUrl,
    title: `${whiteName} vs ${blackName}`,
    whitePlayer: {
      username: whiteName,
      rating: game.players.white?.rating || 0,
    },
    blackPlayer: {
      username: blackName,
      rating: game.players.black?.rating || 0,
    },
    result: game.winner || "draw",
    time: {
      timeClass: game.speed as TimeClassType,
      ...(initial !== undefined && { initial }),
      ...(increment !== undefined && { increment }),
      ...(daysPerTurn !== undefined && { daysPerTurn }),
      ...(clocks && { clocks }),
    },
    playedAt: new Date(game.createdAt),
    pgn: game.pgn,
    finalFen: game.lastFen,
    isRated: game.rated,
    ...(opening && { opening }),
    ...(moves && { moves }),
  };
};

/**
 * Normalizes a raw Chess.com game response into the canonical Chess Vault `NormalizedGame` model.
 *
 * Normalization details:
 * - Uses `game.time_class` as the canonical `time.timeClass`.
 * - Parses `game.time_control` for live controls (`<initial>`, `<initial>+<increment>`) converted to milliseconds.
 * - Converts Daily time controls (`1/<seconds>`) into integer `daysPerTurn`.
 * - Extracts mainline ply clocks in milliseconds from PGN `%clk` annotations.
 */
export const normalizeChessComGame = ({
  game,
  userId,
  username,
  folderIds,
}: {
  game: Chess_Com_Game;
  userId: string;
  username: string;
  folderIds?: string[] | null;
}): NormalizedGame => {
  const opening = parseChessComOpening(game.pgn);
  const moves = getPgnMoveCount(game.pgn);
  const clocks = parsePgnClocks(game.pgn);
  const parsedTime = parseChessComTimeControl(game.time_control);

  const title = `${game.white.username} vs ${game.black.username}`;

  const result =
    game.white.result === "win"
      ? "white"
      : game.black.result === "win"
        ? "black"
        : "draw";

  const userPlayedAs: "white" | "black" =
    game.white.username.toLowerCase() === username.toLowerCase()
      ? "white"
      : "black";

  return {
    userId,
    userPlayedAs,
    folderIds: folderIds ?? null,
    platform: "chess.com",
    platformGameId: game.uuid,
    sourceUrl: game.url,
    title,
    whitePlayer: {
      username: game.white.username,
      rating: game.white.rating,
    },
    blackPlayer: {
      username: game.black.username,
      rating: game.black.rating,
    },
    result,
    time: {
      timeClass: game.time_class as TimeClassType,
      ...(parsedTime.initial !== undefined && { initial: parsedTime.initial }),
      ...(parsedTime.increment !== undefined && {
        increment: parsedTime.increment,
      }),
      ...(parsedTime.daysPerTurn !== undefined && {
        daysPerTurn: parsedTime.daysPerTurn,
      }),
      ...(clocks && { clocks }),
    },
    playedAt: new Date(game.end_time * 1000),
    pgn: game.pgn,
    finalFen: game.fen,
    isRated: game.rated,
    ...(opening && { opening }),
    ...(moves && { moves }),
  };
};

