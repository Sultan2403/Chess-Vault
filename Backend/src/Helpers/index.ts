import { TimeClassType } from "../Config/constants";
import {
  Chess_Com_Game,
  NormalizedGame,
  Lichess_Game,
  getPgnMoveCount,
} from "../Types/games.types";
import { parseLichessOpening, parseChessComOpening } from "../Utils/pgn";

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
    timeClass: game.speed as TimeClassType,
    playedAt: new Date(game.createdAt),
    pgn: game.pgn,
    finalFen: game.lastFen,
    isRated: game.rated,
    ...(opening && { opening }),
    ...(moves && { moves }),
  };
};

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
    timeClass: game.time_class as TimeClassType,
    playedAt: new Date(game.end_time * 1000),
    pgn: game.pgn,
    finalFen: game.fen,
    isRated: game.rated,
    ...(opening && { opening }),
    ...(moves && { moves }),
  };
};
