import { EventEmitter } from "events";
import ndjson from "ndjson";
import {
  ImportTrigger,
  ImportStatus,
  ImportCounters,
  ImportProgressPayload,
  ImportCompletePayload,
  ImportFailedPayload,
  ChessComSupportedRules,
  LichessSupportedVariants,
} from "@chess-vault/shared";
import Imports from "../DB/Models/imports.model";
import LinkedAccounts from "../DB/Models/linked_accounts.model";
import Accounts from "../DB/Models/accounts.model";
import Games from "../DB/Models/games.model";
import chessComApi from "../Api/chess_com.api";
import lichessApi from "../Api/lichess.api";
import { normalizeChessComGame, normalizeLichessGame } from "../Helpers";
import { capCoordinator } from "../Utils/capCoordinator";
import { logger } from "../Config/logger";
import { enqueueImportJob } from "../Jobs/import.queue";
import {
  Lichess_Game,
  NormalizedGame,
} from "../Types/games.types";

export const importEvents = new EventEmitter();

export const IMPORT_EVENT_NAMES = {
  PROGRESS: "import:progress",
  COMPLETED: "import:completed",
  FAILED: "import:failed",
} as const;

/**
 * Platform Stream / Batch Generators
 */

/**
 * Fetches Chess.com archives and yields batches of normalized games (one month archive per batch, newest first).
 */
async function* fetchChessComBatches(
  username: string,
  userId: string,
  lastArchiveUrl?: string | null,
): AsyncGenerator<{ batch: NormalizedGame[]; archiveUrl: string; skipped: number }> {
  const archivesResponse = await chessComApi.getPlayerArchives(username);
  const archiveUrls = archivesResponse.archives;

  if (!archiveUrls || archiveUrls.length === 0) {
    return;
  }

  // Filter archives by lastArchiveUrl if present (only process archives >= lastArchiveUrl)
  let filteredUrls = archiveUrls;
  if (lastArchiveUrl) {
    const lastMatch = lastArchiveUrl.match(/\/(\d{4})\/(\d{2})$/);
    if (lastMatch) {
      const minMonthPattern = `${lastMatch[1]}/${lastMatch[2]}`;
      filteredUrls = archiveUrls.filter((url) => {
        const match = url.match(/\/(\d{4})\/(\d{2})$/);
        if (!match) return true;
        const archiveMonth = `${match[1]}/${match[2]}`;
        return archiveMonth >= minMonthPattern;
      });
    }
  }

  // Process archives newest first
  const recentArchives = [...filteredUrls].reverse();

  for (const archiveUrl of recentArchives) {
    const monthlyData = await chessComApi.getGamesFromArchiveUrl(archiveUrl);
    if (!monthlyData.games || monthlyData.games.length === 0) continue;

    // Games within archive sorted newest first
    const reversedGames = [...monthlyData.games].reverse();
    const batch: NormalizedGame[] = [];

    let skipped = 0;
    for (const rawGame of reversedGames) {
      const rule = rawGame.rules?.toLowerCase();
      if (!rule || !(ChessComSupportedRules as readonly string[]).includes(rule)) {
        skipped++;
        continue;
      }

      batch.push(
        normalizeChessComGame({
          game: rawGame,
          userId,
          username,
        }),
      );
    }
    if (batch.length > 0 || skipped > 0) {
      yield { batch, archiveUrl, skipped };
    }


  }
}

/**
 * Streams Lichess games in chunks of CHUNK_SIZE normalized games, newest first.
 */
async function* fetchLichessBatches(
  username: string,
  userId: string,
  max: number,
  lastGamePlayedAt?: number | null,
): AsyncGenerator<{ batch: NormalizedGame[]; skipped: number }> {
  // Apply a 2-minute overlap buffer to guarantee no mid-run finished games are missed
  const since = lastGamePlayedAt
    ? Math.max(0, lastGamePlayedAt - 2 * 60 * 1000)
    : undefined;
  const streamResponse = await lichessApi.getUserGames(username, {
    max,
    since,
  });

  const CHUNK_SIZE = 100;
  let buffer: NormalizedGame[] = [];

  const stream = streamResponse.pipe(ndjson.parse());

  const supportedVariants = LichessSupportedVariants.map((v) =>
    v.toLowerCase(),
  );

  let skipped = 0;
  for await (const rawGame of stream) {
    const game = rawGame as Lichess_Game;
    const variant = game.variant?.toLowerCase();
    if (!variant || !supportedVariants.includes(variant)) {
      skipped++;
      continue;
    }

    buffer.push(
      normalizeLichessGame({
        game,
        userId,
        username,
      }),
    );

    if (buffer.length >= CHUNK_SIZE) {
      yield { batch: buffer, skipped };
      buffer = [];
      skipped = 0;
    }
  }

  if (buffer.length > 0 || skipped > 0) {
    yield { batch: buffer, skipped };
  }
}

/**
 * Processes a single batch of normalized games:
 * 1. Reserves Redis capacity
 * 2. Writes allowed games via bulkWrite
 * 3. Refunds duplicate capacity to Redis
 * 4. Updates counters
 */
async function processBatch({
  userId,
  batch,
  planLimit,
  counters,
}: {
  userId: string;
  batch: NormalizedGame[];
  planLimit: number;
  counters: ImportCounters;
}): Promise<{ isCapped: boolean }> {
  counters.fetched += batch.length;

  const reservation = await capCoordinator.reserveCapacity(
    userId,
    batch.length,
    planLimit,
  );

  if (reservation.allowedCount <= 0) {
    return { isCapped: true };
  }

  const allowedBatch =
    reservation.allowedCount < batch.length
      ? batch.slice(0, reservation.allowedCount)
      : batch;

  const ops = allowedBatch.map((game) => ({
    updateOne: {
      filter: {
        userId: game.userId,
        platform: game.platform,
        platformGameId: game.platformGameId,
      },
      update: {
        $setOnInsert: {
          ...game,
          folderIds: null,
        },
      },
      upsert: true,
    },
  }));

  const writeResult = await Games.bulkWrite(ops as any, { ordered: false });

  counters.inserted += writeResult.upsertedCount;
  counters.duplicates += writeResult.matchedCount;

  if (writeResult.matchedCount > 0) {
    await capCoordinator.reconcileCapacity(userId, writeResult.matchedCount);
  }

  return { isCapped: reservation.isCapped };
}

/**
 * Finalizes a successful or partial import run:
 * 1. Sets status on Import doc
 * 2. Updates LinkedAccount (lastSyncedAt based on newest game, oldestSyncedAt, hasMoreHistory, syncStatus)
 * 3. Emits domain completion event
 */
async function finalizeRun({
  importDoc,
  linkedAccountId,
  isCapped,
  counters,
  platform,
  newestGameAt,
  lastArchiveUrl,
}: {
  importDoc: any;
  linkedAccountId: string;
  isCapped: boolean;
  counters: ImportCounters;
  platform: string;
  newestGameAt?: Date | null;
  lastArchiveUrl?: string | null;
}) {
  const finalStatus: ImportStatus = isCapped ? "partial" : "completed";
  importDoc.status = finalStatus;
  importDoc.finishedAt = new Date();
  importDoc.counters = counters;
  await importDoc.save();

  const accountUpdate: Record<string, unknown> = {
    syncStatus: "healthy",
    lastSyncedAt: new Date(),
  };

  if (platform === "chess.com") {
    if (lastArchiveUrl) {
      accountUpdate["cursor.lastArchiveUrl"] = lastArchiveUrl;
    }
  } else {
    // Lichess uses timestamp cursor (milliseconds)
    if (newestGameAt) {
      accountUpdate["cursor.lastGamePlayedAt"] = newestGameAt.getTime();
    }
  }

  await LinkedAccounts.updateOne({ _id: linkedAccountId }, accountUpdate);

  importEvents.emit(IMPORT_EVENT_NAMES.COMPLETED, {
    userId: importDoc.userId,
    importId: importDoc.id,
    platform: importDoc.platform,
    status: finalStatus,
    counters,
    message:
      finalStatus === "partial"
        ? "Import completed up to account cap limit"
        : "Import completed successfully",
  } as ImportCompletePayload);
}

/**
 * Handles errors during an import run:
 * 1. Sets failed status and error code on Import doc
 * 2. Marks LinkedAccount syncStatus as needs_attention
 * 3. Emits domain failure event
 */
async function handleRunFailure({
  importDoc,
  linkedAccountId,
  error,
  counters,
}: {
  importDoc: any;
  linkedAccountId: string;
  error: { code: string; message: string };
  counters?: ImportCounters;
}) {
  importDoc.status = "failed";
  importDoc.error = error;
  importDoc.finishedAt = new Date();
  if (counters) {
    importDoc.counters = counters;
  }
  await importDoc.save();

  await LinkedAccounts.updateOne(
    { _id: linkedAccountId },
    { syncStatus: "needs_attention" },
  );

  importEvents.emit(IMPORT_EVENT_NAMES.FAILED, {
    userId: importDoc.userId,
    importId: importDoc.id,
    platform: importDoc.platform,
    error,
  } as ImportFailedPayload);
}

export const importService = {
  /**
   * Returns active import (queued or running) for a given linked account if one exists.
   */
  async getActiveImport(linkedAccountId: string) {
    return Imports.findOne({
      linkedAccountId,
      status: { $in: ["queued", "running"] },
    });
  },

  /**
   * Idempotent import initializer.
   * If an active run exists for this account, returns it instead of duplicating.
   */
  async startImport({
    userId,
    linkedAccountId,
    trigger,
  }: {
    userId: string;
    linkedAccountId: string;
    trigger: ImportTrigger;
  }) {
    const active = await this.getActiveImport(linkedAccountId);
    if (active) {
      return active;
    }

    const linkedAccount = await LinkedAccounts.findOne({
      _id: linkedAccountId,
      userId,
    });
    if (!linkedAccount) {
      throw new Error("Linked account not found");
    }

    let importDoc;
    try {
      importDoc = await Imports.create({
        userId,
        linkedAccountId,
        platform: linkedAccount.platform,
        trigger,
        status: "queued",
        counters: { fetched: 0, inserted: 0, duplicates: 0, skipped: 0 },
        startedAt: new Date(),
      });
    } catch (err: unknown) {
      // If a concurrent request created an active run in the race window, return that active run
      if ((err as { code?: number })?.code === 11000) {
        const concurrentActive = await this.getActiveImport(linkedAccountId);
        if (concurrentActive) return concurrentActive;
      }
      throw err;
    }

    const job = await enqueueImportJob({
      importId: importDoc.id,
      userId,
      linkedAccountId: linkedAccount.id,
      platform: linkedAccount.platform,
    });

    importDoc.jobRef = job.id;
    await importDoc.save();

    return importDoc;
  },

  /**
   * Central processor for a single import run.
   */
  async processImportRun(importId: string): Promise<void> {
    const importDoc = await Imports.findById(importId);
    if (!importDoc) {
      logger.error({ importId }, "Import run document not found");
      return;
    }

    const { userId, linkedAccountId, platform } = importDoc;

    const counters: ImportCounters = {
      fetched: 0,
      inserted: 0,
      duplicates: 0,
      skipped: 0,
    };

    let isCapped = false;

    try {
      const [account, linkedAccount] = await Promise.all([
        Accounts.findOne({ userId }),
        LinkedAccounts.findById(linkedAccountId),
      ]);

      if (!linkedAccount || !account) {
        await handleRunFailure({
          importDoc,
          linkedAccountId: linkedAccountId.toString(),
          error: { code: "ACCOUNT_NOT_FOUND", message: "Account or linked account missing" },
        });
        return;
      }

      // Step 1: Mark running
      importDoc.status = "running";
      await importDoc.save();

      // Step 2: Determine cap & seed coordinator
      const planLimit = account.plan.gameBankLimit;
      const currentDbCount = await Games.countDocuments({ userId });
      await capCoordinator.initUserCap(userId, currentDbCount);

      const remainingCapacity = Math.max(0, planLimit - currentDbCount);
      if (remainingCapacity <= 0) {
        await finalizeRun({
          importDoc,
          linkedAccountId: linkedAccountId.toString(),
          isCapped: true,
          counters: importDoc.counters,
          platform,
        });
        return;
      }

      let newestGameAt: Date | null = null;
      let lastProcessedArchiveUrl: string | null = null;

      if (platform === "chess.com") {
        const batchGenerator = fetchChessComBatches(
          linkedAccount.username,
          userId,
          linkedAccount.cursor?.lastArchiveUrl,
        );

        for await (const { batch, archiveUrl, skipped } of batchGenerator) {
          if (!lastProcessedArchiveUrl) {
            lastProcessedArchiveUrl = archiveUrl;
          }
          counters.skipped += skipped;
          counters.fetched += skipped;

          const result = await processBatch({
            userId,
            batch,
            planLimit,
            counters,
          });

          if (result.isCapped) {
            isCapped = true;
          }

          importDoc.counters = { ...counters };
          await importDoc.save();

          importEvents.emit(IMPORT_EVENT_NAMES.PROGRESS, {
            userId,
            importId,
            platform,
            counters: { ...counters },
            vaultUsage: {
              current: currentDbCount + counters.inserted,
              limit: planLimit,
            },
          } as ImportProgressPayload);

          if (isCapped) {
            break;
          }
        }
      } else {
        const batchGenerator = fetchLichessBatches(
          linkedAccount.username,
          userId,
          remainingCapacity,
          linkedAccount.cursor?.lastGamePlayedAt,
        );

        for await (const { batch, skipped } of batchGenerator) {
          counters.skipped += skipped;
          counters.fetched += skipped;
          for (const game of batch) {
            if (!newestGameAt || game.playedAt > newestGameAt) {
              newestGameAt = game.playedAt;
            }
          }

          const result = await processBatch({
            userId,
            batch,
            planLimit,
            counters,
          });

          if (result.isCapped) {
            isCapped = true;
          }

          importDoc.counters = { ...counters };
          await importDoc.save();

          importEvents.emit(IMPORT_EVENT_NAMES.PROGRESS, {
            userId,
            importId,
            platform,
            counters: { ...counters },
            vaultUsage: {
              current: currentDbCount + counters.inserted,
              limit: planLimit,
            },
          } as ImportProgressPayload);

          if (isCapped) {
            break;
          }
        }
      }

      // Step 5: Finalize run
      await finalizeRun({
        importDoc,
        linkedAccountId: linkedAccountId.toString(),
        isCapped,
        counters,
        platform,
        newestGameAt,
        lastArchiveUrl: lastProcessedArchiveUrl,
      });
    } catch (err: unknown) {
      logger.error({ err, importId, userId, platform }, "Import run failed");

      const error = {
        code: (err as { code?: string })?.code || "IMPORT_ERROR",
        message: err instanceof Error ? err.message : "An error occurred during game import",
      };

      await handleRunFailure({
        importDoc,
        linkedAccountId: linkedAccountId.toString(),
        error,
        counters,
      });
    } finally {
      // Clean up Redis cap key if no other imports running
      const remainingActive = await Imports.countDocuments({
        userId,
        status: { $in: ["queued", "running"] },
      });
      if (remainingActive === 0) {
        await capCoordinator.clearUserCap(userId);
      }
    }
  },
};
