import { Chess_Com_Game, Game, Lichess_Game } from "../Types/games.types";

const import_Chess_Com_Game = async () => {};

const import_Lichess_Game = async () => {};

export const normalizeLichessGame = ({
  game,
  userId,
  folderId,
}: {
  game: Lichess_Game;
  userId: string;
  folderId: string;
}): Game => {
  const sourceUrl = `https://lichess.org/${game.id}`;
  return {
    userId,
    folderId,
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
    timeClass: game.speed,
    playedAt: new Date(game.createdAt * 1000),
    pgn: game.pgn,
    isRated: game.rated,
  };
};

export const normalizeChessComGame = ({
  game,
  userId,
  folderId,
}: {
  game: Chess_Com_Game;
  userId: string;
  folderId: string;
}): Game => {
  const title = `${game.white.username} vs ${game.black.username}`;
  const result =
    game.white.result === "win"
      ? "white"
      : game.black.result === "win"
        ? "black"
        : "draw";

  return {
    userId,
    folderId,
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
    timeClass: game.time_class,
    playedAt: new Date(game.end_time * 1000),
    pgn: game.pgn,
    isRated: game.rated,
  };
};