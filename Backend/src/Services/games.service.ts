import chessComApi from "../Api/chess_com.api";
import ndjson from "ndjson";
import mongoose from "mongoose";
import Games from "../DB/Models/games.model";
import { normalizeChessComGame, normalizeLichessGame } from "../Helpers";
import { Platforms, MAX_GAMES_PER_USER } from "../Config/constants";
import { logger } from "../Config/logger";
import {
  ImportGamesParams,
  ImportGameParams,
  Lichess_Game,
  NormalizedGame,
  Game,
  ImportResult,
  GameSearchParams,
} from "../Types/games.types";
import lichessApi from "../Api/lichess.api";

export const importGames = async ({
  userId,
  folderIds,
  username,
  platform,
}: ImportGamesParams): Promise<ImportResult> => {
  const import_Chess_Com_Games = async ({
    userId,
    folderIds,
    username,
  }: ImportGameParams): Promise<ImportResult> => {
    logger.info({ username }, "Starting Chess.com import");
    const response = await chessComApi.getPlayerArchives(username);
    const archiveUrls = response.archives;

    if (!archiveUrls || archiveUrls.length === 0) {
      return {
        success: false,
        message: `No game history found for Chess.com user: ${username}`,
      };
    }

    const recentArchives = [...archiveUrls].reverse();
    let totalImported = 0;

    for (const archiveUrl of recentArchives) {
      if (totalImported >= MAX_GAMES_PER_USER) break;

      const monthlyData = await chessComApi.getGamesFromArchiveUrl(archiveUrl);
      if (!monthlyData.games || monthlyData.games.length === 0) continue;

      const monthlyGames = [...monthlyData.games].reverse();
      const gamesToInsert: NormalizedGame[] = [];

      for (const game of monthlyGames) {
        if (totalImported >= MAX_GAMES_PER_USER) {
          logger.info(
            { limit: MAX_GAMES_PER_USER },
            "Hard limit of games hit mid-archive",
          );
          break;
        }

        const normalizedGame = normalizeChessComGame({
          game,
          userId,
          folderIds,
        });

        gamesToInsert.push(normalizedGame);
        totalImported++;
      }

      if (gamesToInsert.length > 0) {
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
                folderIds: game.folderIds
                  ? game.folderIds.map((id) => new mongoose.Types.ObjectId(id))
                  : null,
              },
            },
            upsert: true,
          },
        }));
        const res = await Games.bulkWrite(ops as any);
        logger.info(
          {
            upsertedCount: res.upsertedCount,
            matchedCount: res.matchedCount,
            totalImported,
          },
          "Upserted Chess.com archive batch into DB",
        );
      }
    }

    logger.info({ totalImported }, "Finished Chess.com import");
    return {
      success: true,
      message: `Imported ${totalImported} games from Chess.com`,
    };
  };

  const import_Lichess_Game = async ({
    userId,
    folderIds,
    username,
  }: ImportGameParams): Promise<ImportResult> => {
    logger.info({ username }, "Starting Lichess import");

    const response = await lichessApi.getUserGames(username);

    return new Promise<ImportResult>((resolve, reject) => {
      const CHUNK_SIZE = 500;
      let gamesBuffer: NormalizedGame[] = [];
      let totalUpserted = 0;
      let totalMatched = 0;
      let isProcessingChunk = false;

      const stream = response.pipe(ndjson.parse());

      const flushBuffer = async () => {
        if (gamesBuffer.length === 0) return;
        const currentChunk = [...gamesBuffer];
        gamesBuffer = [];

        const ops = currentChunk.map((game) => ({
          updateOne: {
            filter: {
              userId: game.userId,
              platform: game.platform,
              platformGameId: game.platformGameId,
            },
            update: {
              $setOnInsert: {
                ...game,
                folderIds: game.folderIds
                  ? game.folderIds.map((id) => new mongoose.Types.ObjectId(id))
                  : null,
              },
            },
            upsert: true,
          },
        }));

        const res = await Games.bulkWrite(ops as any);
        totalUpserted += res.upsertedCount;
        totalMatched += res.matchedCount;

        logger.info(
          {
            chunkSize: currentChunk.length,
            upserted: res.upsertedCount,
            matched: res.matchedCount,
            runningTotal: totalUpserted + totalMatched,
          },
          "Flushed Lichess chunk to DB",
        );
      };

      stream.on("data", async (rawGame: Lichess_Game) => {
        const normalized = normalizeLichessGame({
          game: rawGame,
          userId,
          folderIds,
        });

        gamesBuffer.push(normalized);

        if (gamesBuffer.length >= CHUNK_SIZE && !isProcessingChunk) {
          isProcessingChunk = true;
          stream.pause();
          try {
            await flushBuffer();
          } catch (err) {
            stream.destroy();
            return reject(err);
          } finally {
            isProcessingChunk = false;
            stream.resume();
          }
        }
      });

      stream.on("end", async () => {
        try {
          // Flush any remaining items in buffer
          await flushBuffer();

          if (totalUpserted === 0 && totalMatched === 0) {
            return resolve({
              success: true,
              message: "No games found for Lichess user",
            });
          }

          logger.info(
            { totalUpserted, totalMatched },
            "Lichess sync completed successfully",
          );

          resolve({
            success: true,
            message: `Imported ${totalUpserted} new games from Lichess (${totalMatched} duplicates skipped)`,
          });
        } catch (err) {
          reject(err);
        }
      });

      stream.on("error", (err: any) => {
        logger.error({ err }, "Lichess stream error");
        reject(err);
      });
    });
  };

  try {
    if (platform === Platforms.CHESS_COM) {
      return await import_Chess_Com_Games({
        userId,
        folderIds,
        username,
        platform,
      });
    } else {
      return await import_Lichess_Game({
        userId,
        folderIds,
        username,
        platform,
      });
    }
  } catch (error: any) {
    logger.error({ err: error }, "Import failed");
    return { success: false, message: "Something went wrong" };
  }
};

export const searchGames = async ({
  page = 1,
  limit = 15,
  search,
  ...params
}: GameSearchParams): Promise<{
  success: boolean;
  message: string;
  games: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const skip = (page - 1) * limit;

  const { folderIds, ...restParams } = params;

  const query = {
    ...restParams,
    ...(folderIds && folderIds.length > 0
      ? {
          folderIds: {
            $in: folderIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        }
      : {}),
    ...(search && {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { "whitePlayer.username": { $regex: search, $options: "i" } },
        { "blackPlayer.username": { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ],
    }),
  };

  const [games, count] = await Promise.all([
    Games.find(query)
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .transform((games) =>
        games.map((game: any) => {
          const { _id, folderIds, ...rest } = game;

          const normalized: Game = {
            id: _id.toString(),
            folderIds: folderIds
              ? folderIds.map((id: any) => id.toString())
              : null,
            ...rest,
          };

          return normalized;
        }),
      ),

    Games.countDocuments(query),
  ]);

  return {
    success: true,
    message: "Games fetched successfully",
    games,

    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getGameById = async (
  id: string,
  userId: string,
): Promise<Game | null> => {
  const game = await Games.findOne({ _id: id, userId }).lean();
  if (!game) return null;

  const { _id, folderIds, ...rest } = game as any;
  return {
    id: _id.toString(),
    folderIds: folderIds ? folderIds.map((id: any) => id.toString()) : null,
    ...rest,
  };
};
