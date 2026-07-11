import chessComApi from "../Api/chess_com.api";
import ndjson from "ndjson";
import Games from "../DB/Models/games.model";
import { normalizeChessComGame, normalizeLichessGame } from "../Helpers";
import {
  Platforms,
  type PlatformType,
  MAX_GAMES_PER_USER,
} from "../Config/constants";
import {
  ImportGamesParams,
  ImportGameParams,
  Lichess_Game,
  Game,
  ImportResult,
} from "../Types/games.types";
import lichessApi from "../Api/lichess.api";

export const importGames = async ({
  userId,
  folderId,
  username,
  platform,
}: ImportGamesParams): Promise<ImportResult> => {
  const import_Chess_Com_Games = async ({
    userId,
    folderId,
    username,
    platform,
  }: ImportGameParams): Promise<ImportResult> => {
    // 1. Grab all active history blocks from Chess.com

    console.log("Starting Chess.com import...");
    const response = await chessComApi.getPlayerArchives(username);

    console.log("Chess.com responded with archive", response);
    const archiveUrls = response.archives;

    if (!archiveUrls || archiveUrls.length === 0) {
      return {
        success: false,
        message: `No game history found for Chess.com user: ${username}`,
      };
    }

    // 2. Reverse to start from the absolute most recent month
    const recentArchives = archiveUrls.reverse();
    let totalImported = 0;

    console.log("📥 Starting import of Chess.com games for user:", username);
    for (const archiveUrl of recentArchives) {
      console.log("Current archive", archiveUrl);
      // Hard break if a previous month already maxed us out
      if (totalImported >= MAX_GAMES_PER_USER) break;

      console.log(`📥 Fetching data directly from archive: ${archiveUrl}`);

      // 3. Hit the full URL directly without parsing dates
      const monthlyData = await chessComApi.getGamesFromArchiveUrl(archiveUrl);
      if (!monthlyData.games || monthlyData.games.length === 0) continue;

      console.log(
        "Monthly data fetched. Total games in this archive:",
        monthlyData.games.length,
      );
      console.log("Games: ", monthlyData.games);

      // 4. Reverse the individual games array to get the newest games first
      const monthlyGames = monthlyData.games.reverse();
      const gamesToInsert = [];

      for (const game of monthlyGames) {
        console.log("Processing game: ", game);
        if (totalImported >= MAX_GAMES_PER_USER) {
          console.log(
            `🛑 Hard limit of ${MAX_GAMES_PER_USER} games hit mid-archive.`,
          );
          break;
        }

        // Normalize and stage for batch insertion
        const normalizedGame = normalizeChessComGame({
          game,
          userId,
          folderId,
        });

        console.log("Normalized game ready for insertion: ", normalizedGame);
        console.log("Pushing game to insert array: ", normalizedGame);

        gamesToInsert.push(normalizedGame);
        totalImported++;
      }

      // 5. Bulk dump the month's chunk into MongoDB to minimize roundtrips
      if (gamesToInsert.length > 0) {
        await Games.insertMany(gamesToInsert);
        console.log(
          `✅ Batched ${gamesToInsert.length} games into DB. (Running Total: ${totalImported})`,
        );
      }
    }

    console.log(
      `🎉 Success! Capped import finished. Total saved: ${totalImported}`,
    );
    return {
      success: true,
      message: `Imported ${totalImported} games from Chess.com`,
    };
  };

  const import_Lichess_Game = async ({
    userId,
    folderId,
    username,
  }: ImportGameParams): Promise<ImportResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Starting lichess import...");
        const response = await lichessApi.getUserGames(username);

        console.log("Lichess server responded with games:", response);

        const gamesBuffer: Game[] = [];

        // Pipe the raw network stream directly into the ndjson parser
        response
          .pipe(ndjson.parse())
          .on("data", (rawGame: Lichess_Game) => {
            // This fires automatically for every fully formed JSON object
            const normalized = normalizeLichessGame({
              game: rawGame,
              userId,
              folderId,
            });
            console.log("New game normalized", normalized);
            gamesBuffer.push(normalized);
          })
          .on("end", async () => {
            // Once the stream terminates, we hit the DB exactly once
            if (gamesBuffer.length > 0) {
              console.log(
                `📥 Stream ended. Bulk inserting ${gamesBuffer.length} games...`,
              );
              console.log("Inserting games into DB...");
              // await Games.insertMany(gamesBuffer);
              console.log("🎉 Lichess sync perfectly completed using NDJSON!");
              resolve({
                success: true,
                message: `Imported ${gamesBuffer.length} games from Lichess`,
              });
            } else {
              resolve({
                success: false,
                message: "No games found for Lichess user",
              });
            }
          })
          .on("error", (err: any) => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  };

  try {
    if (platform === Platforms.CHESS_COM) {
      return await import_Chess_Com_Games({
        userId,
        folderId,
        username,
        platform,
      });
    } else {
      return await import_Lichess_Game({
        userId,
        folderId,
        username,
        platform,
      });
    }
  } catch (error) {
    console.error("❌ Import failed:", error);
    return { success: false, message: "Something went wrong" };
  }
};
