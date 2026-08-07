import chessComApi from "../Api/chess_com.api";
import ndjson from "ndjson";
import mongoose from "mongoose";
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

      // 4. Reverse the individual games array to get the newest games first
      const monthlyGames = monthlyData.games.reverse();
      const gamesToInsert: Game[] = [];

      for (const game of monthlyGames) {
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

        console.log("Normalized game ready for insertion: ");

        gamesToInsert.push(normalizedGame);
        totalImported++;
      }

      // 5. Bulk dump the month's chunk into MongoDB with upserts to skip duplicates
      if (gamesToInsert.length > 0) {
        console.log("Inserting games to db...");
        const ops = gamesToInsert.map((game) => ({
          updateOne: {
            filter: {
              userId: game.userId,
              platform: game.platform,
              platformGameId: game.platformGameId,
            },
            update: {
              $setOnInsert: {
                ...game,
                folderId: new mongoose.Types.ObjectId(game.folderId),
              },
            },
            upsert: true,
          },
        }));
        const res = await Games.bulkWrite(ops as any);
        console.log(
          `✅ Upserted ${res.upsertedCount} new games into DB (Ignored ${res.matchedCount} existing duplicates). (Running Total: ${totalImported})`,
        );
      }
    }
    console.log(
      `🎉 Success! Capped import finished. Total processed: ${totalImported}`,
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
    console.log("Starting lichess import...");

    const response = await lichessApi.getUserGames(username);

    console.log("Lichess server responded with games stream");

    return new Promise<ImportResult>((resolve, reject) => {
      const gamesBuffer: Game[] = [];

      response
        .pipe(ndjson.parse())
        .on("data", (rawGame: Lichess_Game) => {
          const normalized = normalizeLichessGame({
            game: rawGame,
            userId,
            folderId,
          });

          gamesBuffer.push(normalized);
        })
        .on("end", async () => {
          try {
            if (gamesBuffer.length === 0) {
              return resolve({
                success: true,
                message: "No games found for Lichess user",
              });
            }

            console.log(
              `📥 Stream ended. Bulk upserting ${gamesBuffer.length} games...`,
            );

            const ops = gamesBuffer.map((game) => ({
              updateOne: {
                filter: {
                  userId: game.userId,
                  platform: game.platform,
                  platformGameId: game.platformGameId,
                },
                update: {
                  $setOnInsert: {
                    ...game,
                    folderId: new mongoose.Types.ObjectId(game.folderId),
                  },
                },
                upsert: true,
              },
            }));

            const res = await Games.bulkWrite(ops as any);

            console.log(
              `🎉 Lichess sync completed! Upserted ${res.upsertedCount} new games.`,
            );

            resolve({
              success: true,
              message: `Imported ${res.upsertedCount} new games from Lichess (${res.matchedCount} duplicates skipped)`,
            });
          } catch (err) {
            reject(err);
          }
        })
        .on("error", reject);
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
  } catch (error: any) {
    console.error("❌ Import failed:", error?.message);
    return { success: false, message: "Something went wrong" };
  }
};
