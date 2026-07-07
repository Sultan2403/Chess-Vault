import { Chess_Com_Game, Game } from "../Types/games.types";

const import_Chess_Com_Game = async () => {};

const import_Lichess_Game = async () => {};

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
  const result = game.white.result === "win" ? "White won" : game.black.result === "win" ? "Black won" : "Draw";

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
    timeControl: game.time_control,
    timeClass: game.time_class,
    playedAt: new Date(game.end_time),
    pgn: game.pgn,
    isRated: game.rated,
  };
};
