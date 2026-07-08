import chessComApi from "../Api/chess_com.api";
import Games from "../DB/Models/games.model";
import { normalizeChessComGame, normalizeLichessGame } from "../Helpers";
import {
  Platforms,
  type PlatformType,
  MAX_GAMES_PER_USER,
} from "../Config/constants";
import { ImportGamesParams, ImportGameParams } from "../Types/games.types";

export const importGames = async ({
  userId,
  folderId,
  username,
  platform,
}: ImportGamesParams): Promise<void> => {
  const import_Chess_Com_Games = async ({
    userId,
    folderId,
    username,
  }: ImportGameParams): Promise<void> => {
    try {
      // 1. Grab all active history blocks from Chess.com
      const response = await chessComApi.getPlayerArchives(username);
      const archiveUrls = response.archives;

      if (!archiveUrls || archiveUrls.length === 0) {
        console.log(`ℹ️ No game history found for Chess.com user: ${username}`);
        return;
      }

      // 2. Reverse to start from the absolute most recent month
      const recentArchives = archiveUrls.reverse();
      let totalImported = 0;

      for (const archiveUrl of recentArchives) {
        // Hard break if a previous month already maxed us out
        if (totalImported >= MAX_GAMES_PER_USER) break;

        console.log(`📥 Fetching data directly from archive: ${archiveUrl}`);

        // 3. Hit the full URL directly without parsing dates
        const monthlyData =
          await chessComApi.getGamesFromArchiveUrl(archiveUrl);
        if (!monthlyData.games || monthlyData.games.length === 0) continue;

        // 4. Reverse the individual games array to get the newest games first
        const monthlyGames = monthlyData.games.reverse();
        const gamesToInsert = [];

        for (const game of monthlyGames) {
          if (totalImported >= MAX_GAMES_PER_USER) {
            console.log(
              `🛑 Hard limit of ${MAX_GAMES_PER_USER} games hit mid-archive.`,
            );
            break;
          }

          // Normalize and stage for batch insertion
          gamesToInsert.push(normalizeChessComGame({ game, userId, folderId }));
          totalImported++;
        }

        // 5. Bulk dump the month's chunk into MongoDB to minimize roundtrips
        if (gamesToInsert.length > 0) {
          // We wanna save according to user's filters so we apply filters on the games first.
          // await Games.insertMany(gamesToInsert);
          // console.log(
          //   `✅ Batched ${gamesToInsert.length} games into DB. (Running Total: ${totalImported})`,
          // );
        }
      }

      console.log(
        `🎉 Success! Capped import finished. Total saved: ${totalImported}`,
      );
    } catch (error) {
      console.error("❌ Aggregated Chess.com sync operation failed:", error);
    }
  };

  const import_Lichess_Game = async ({
    userId,
    folderId,
    username,
  }: ImportGameParams) => {};

  if (platform === Platforms.CHESS_COM) {
    await import_Chess_Com_Games({ userId, folderId, username });
  } else {
    await import_Lichess_Game({ userId, folderId, username });
  }
};
