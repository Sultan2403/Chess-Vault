import chessComApi from "../Api/chess_com.api";
import Games from "../DB/Models/games.model";
import { normalizeChessComGame, normalizeLichessGame } from "../Helpers";
import { Platforms, type PlatformType } from "../Config/constants";
import { ImportGamesParams, ImportGameParams } from "../Types/games.types";

export const importGames = async ({
  userId,
  folderId,
  username,
  platform,
}: ImportGamesParams): Promise<void> => {
  const import_Chess_Com_Game = async ({
    userId,
    folderId,
    username,
  }: ImportGameParams) => {
    // Default timeframes to be determined.

    const response = await chessComApi.getPlayerGamesForMonth({
      username,
      year: 2023,
      month: 6,
    });

    const normalizedGames = response.games.map((game) => {
      return normalizeChessComGame({ game, userId, folderId });
    });

    await Games.insertMany(normalizedGames);
  };

  const import_Lichess_Game = async ({
    userId,
    folderId,
    username,
  }: ImportGameParams) => {};
  
  if (platform === Platforms.CHESS_COM) {
    await import_Chess_Com_Game({ userId, folderId, username });
  } else {
    await import_Lichess_Game({ userId, folderId, username });
  }
};
