import { TimeClassType } from "../Config/constants";
import {
  Chess_Com_Game,
  NormalizedGame,
  Lichess_Game,
} from "../Types/games.types";

export const normalizeLichessGame = ({
  game,
  userId,
  folderIds,
}: {
  game: Lichess_Game;
  userId: string;
  folderIds?: string[] | null;
}): NormalizedGame => {
  const sourceUrl = `https://lichess.org/${game.id}`;
  return {
    userId,
    folderIds: folderIds ?? null,
    platform: "lichess",
    platformGameId: game.id,
    sourceUrl,
    title: `${game.players.white.user.name} vs ${game.players.black.user.name}`,
    whitePlayer: {
      username: game.players.white.user.name,
      rating: game.players.white.rating,
    },
    blackPlayer: {
      username: game.players.black.user.name,
      rating: game.players.black.rating,
    },
    result: game.winner || "draw",
    timeClass: game.speed as TimeClassType,
    playedAt: new Date(game.createdAt * 1000),
    pgn: game.pgn,
    isRated: game.rated,
  };
};

export const normalizeChessComGame = ({
  game,
  userId,
  folderIds,
}: {
  game: Chess_Com_Game;
  userId: string;
  folderIds?: string[] | null;
}): NormalizedGame => {
  const title = `${game.white.username} vs ${game.black.username}`;
  const result =
    game.white.result === "win"
      ? "white"
      : game.black.result === "win"
        ? "black"
        : "draw";

  return {
    userId,
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
    isRated: game.rated,
  };
};
