/**
 * Migration 002 — Full schema migration for production game documents
 *
 * Transforms all game documents from the old schema shape to the current one.
 *
 * Changes applied per document:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. `folderId`  (single ObjectId | absent)  →  `folderIds` (ObjectId[] | null)
 * 2. `timeClass` (top-level string)          →  `time`      (nested object with
 *                                                timeClass + initial/increment/
 *                                                daysPerTurn parsed from the PGN
 *                                                [TimeControl] header)
 * 3. `userPlayedAs`                          →  derived by comparing the vault
 *                                                user's linked platform username
 *                                                (from linked_accounts) against
 *                                                whitePlayer.username on the
 *                                                correct platform
 * 4. `opening`                               →  populated on the fly using the
 *                                                existing parseChessComOpening /
 *                                                parseLichessOpening helpers
 * 5. `moves`                                 →  populated on the fly using the
 *                                                existing getPgnMoveCount helper
 * 6. `finalFen`                              →  extracted from [CurrentPosition]
 *                                                PGN header via parsePgnHeader
 * 7. `playedAt`                              →  validated; if the stored value
 *                                                is absurd (year > 2100) it is
 *                                                re-derived from [UTCDate] +
 *                                                [UTCTime] PGN headers
 * 8. Old fields removed:  `folderId`, `timeClass`
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Run with:
 *   npx tsx migrations/002_migrate_game_schema.ts [--dry-run]
 *
 * The --dry-run flag prints what would change without writing anything.
 */

import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Existing helpers — no duplication
import {
  parsePgnHeader,
  parseChessComOpening,
  parseChessComTimeControl,
  parsePgnClocks,
} from "../src/Utils/pgn.js";
import { getPgnMoveCount } from "@chess-vault/shared";

// ---------------------------------------------------------------------------
// Bootstrap env
// ---------------------------------------------------------------------------
dotenv.config({
  path: path.resolve(import.meta.dirname, "../.env"),
});

const MONGO_URI = process.env.MONGO_DB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_DB_URI is not set in the environment.");
  process.exit(1);
}

const isDryRun = process.argv.includes("--dry-run");
const BATCH_SIZE = 200;

// ---------------------------------------------------------------------------
// Types for raw (old-schema) documents
// ---------------------------------------------------------------------------
interface OldGameDoc {
  _id: mongoose.Types.ObjectId;
  userId: string;
  platform: "chess.com" | "lichess";
  platformGameId: string;
  sourceUrl: string;
  title?: string;
  whitePlayer: { username: string; rating: number };
  blackPlayer: { username: string; rating: number };
  result: "white" | "black" | "draw";
  isRated: boolean;
  pgn: string;
  playedAt: Date;
  // Old fields
  folderId?: mongoose.Types.ObjectId;
  timeClass?: string;
  // New fields (may already be partially set if partially migrated)
  folderIds?: (mongoose.Types.ObjectId | null)[] | null;
  time?: {
    timeClass: string;
    initial?: number;
    increment?: number;
    daysPerTurn?: number;
    clocks?: number[];
  };
  userPlayedAs?: "white" | "black";
  opening?: { eco?: string; name?: string; variation?: string };
  moves?: { count: number; plies: number };
  finalFen?: string;
}

// ---------------------------------------------------------------------------
// Helpers that aren't already in the shared/backend utils
// ---------------------------------------------------------------------------

/**
 * Parses opening details from a lichess PGN string.
 * Lichess embeds [ECO] and [Opening "Name: Variation"] headers in the PGN
 * itself (unlike the structured API object used in normalizeLichessGame).
 * We reuse parsePgnHeader and replicate the same split logic.
 */
function parseLichessOpeningFromPgn(
  pgn: string,
): { eco?: string; name?: string; variation?: string } | undefined {
  const eco = parsePgnHeader(pgn, "ECO");
  const rawOpening = parsePgnHeader(pgn, "Opening");

  if (!eco && !rawOpening) return undefined;

  if (rawOpening) {
    const colonIdx = rawOpening.indexOf(": ");
    const name =
      colonIdx >= 0 ? rawOpening.substring(0, colonIdx) : rawOpening;
    const variation =
      colonIdx >= 0 ? rawOpening.substring(colonIdx + 2) : undefined;
    return { eco, name, variation };
  }

  return { eco };
}

/**
 * Returns true when the stored playedAt is absurd (year > 2100 or < 2000),
 * which indicates a corrupted timestamp (e.g. year 58588 seen in prod).
 */
function isPlayedAtBroken(date: Date | undefined): boolean {
  if (!date || isNaN(date.getTime())) return true;
  const year = date.getFullYear();
  return year > 2100 || year < 2000;
}

/**
 * Re-derives playedAt from [UTCDate] + [UTCTime] PGN headers.
 * Returns undefined if headers are missing or produce an invalid date.
 */
function derivePlayedAtFromPgn(pgn: string): Date | undefined {
  const utcDate = parsePgnHeader(pgn, "UTCDate"); // e.g. "2026.08.14"
  const utcTime = parsePgnHeader(pgn, "UTCTime"); // e.g. "14:25:01"
  if (!utcDate || !utcTime) return undefined;

  const isoString = `${utcDate.replace(/\./g, "-")}T${utcTime}Z`;
  const d = new Date(isoString);
  return isNaN(d.getTime()) ? undefined : d;
}

// ---------------------------------------------------------------------------
// Build the update payload for a single document.
// Returns null if the document already matches the current schema.
// ---------------------------------------------------------------------------
function buildUpdatePayload(
  doc: OldGameDoc,
  ownerUsername: string | undefined,
): {
  $set: Record<string, unknown>;
  $unset: Record<string, "">;
} | null {
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ""> = {};
  let changed = false;

  // ── 1. folderId → folderIds ──────────────────────────────────────────────
  const hasFolderId = doc.folderId != null;
  const hasNewFolderIds = doc.folderIds !== undefined;

  if (hasFolderId || !hasNewFolderIds) {
    changed = true;
    $set.folderIds = hasFolderId ? [doc.folderId] : null;
    if (hasFolderId) $unset.folderId = "";
  }

  // ── 2. timeClass + PGN [TimeControl] → time object ──────────────────────
  const hasTimeObject = doc.time != null;
  const hasOldTimeClass = doc.timeClass !== undefined;

  if (!hasTimeObject || hasOldTimeClass) {
    changed = true;
    const timeClassValue = doc.timeClass ?? doc.time?.timeClass ?? "rapid";
    const parsed = parseChessComTimeControl(parsePgnHeader(doc.pgn, "TimeControl"));

    const timeObj: Record<string, unknown> = { timeClass: timeClassValue };
    if (parsed.initial !== undefined) timeObj.initial = parsed.initial;
    if (parsed.increment !== undefined) timeObj.increment = parsed.increment;
    if (parsed.daysPerTurn !== undefined) timeObj.daysPerTurn = parsed.daysPerTurn;
    // Preserve existing clocks if already stored
    if (doc.time?.clocks && doc.time.clocks.length > 0) {
      timeObj.clocks = doc.time.clocks;
    } else {
      // Attempt to parse clocks from PGN annotations
      const clocks = parsePgnClocks(doc.pgn);
      if (clocks) timeObj.clocks = clocks;
    }

    $set.time = timeObj;
    if (hasOldTimeClass) $unset.timeClass = "";
  }

  // ── 3. userPlayedAs ──────────────────────────────────────────────────────
  if (!doc.userPlayedAs) {
    changed = true;
    if (ownerUsername) {
      $set.userPlayedAs =
        doc.whitePlayer.username.toLowerCase() === ownerUsername.toLowerCase()
          ? "white"
          : "black";
    } else {
      // Can't determine — log a warning; default to black
      $set.userPlayedAs = "black";
    }
  }

  // ── 4. opening ───────────────────────────────────────────────────────────
  if (!doc.opening) {
    const opening =
      doc.platform === "chess.com"
        ? parseChessComOpening(doc.pgn)
        : parseLichessOpeningFromPgn(doc.pgn);

    if (opening) {
      changed = true;
      $set.opening = opening;
    }
  }

  // ── 5. moves ─────────────────────────────────────────────────────────────
  if (!doc.moves) {
    const moves = getPgnMoveCount(doc.pgn);
    if (moves.plies > 0) {
      changed = true;
      $set.moves = moves;
    }
  }

  // ── 6. finalFen — chess.com stores it in [CurrentPosition] ───────────────
  if (!doc.finalFen) {
    const fen = parsePgnHeader(doc.pgn, "CurrentPosition");
    if (fen) {
      changed = true;
      $set.finalFen = fen;
    }
  }

  // ── 7. playedAt — fix absurd timestamps ──────────────────────────────────
  if (isPlayedAtBroken(doc.playedAt)) {
    const fixed = derivePlayedAtFromPgn(doc.pgn);
    if (fixed) {
      changed = true;
      $set.playedAt = fixed;
    }
  }

  if (!changed) return null;

  return { $set, $unset };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI!);
  console.log("✅ Connected.\n");

  if (isDryRun) console.log("⚠️  DRY RUN mode — no writes will be performed.\n");

  const db = mongoose.connection.db!;
  const gamesCollection = db.collection<OldGameDoc>("games");
  const linkedAccountsCollection = db.collection("linked_accounts");

  // ── Build userId → platform → normalizedUsername lookup ──────────────────
  console.log("📋 Loading linked accounts...");
  const linkedAccounts = await linkedAccountsCollection.find({}).toArray();

  // Map: userId → platform → normalizedUsername (already lowercase in DB)
  const userPlatformMap = new Map<string, Map<string, string>>();
  for (const la of linkedAccounts) {
    if (!userPlatformMap.has(la.userId)) {
      userPlatformMap.set(la.userId, new Map());
    }
    userPlatformMap
      .get(la.userId)!
      .set(la.platform, la.normalizedUsername ?? la.username?.toLowerCase());
  }
  console.log(`✅ Loaded linked accounts for ${userPlatformMap.size} user(s).\n`);

  // Only process real Clerk user documents
  const filter = { userId: /^user_/ };
  const total = await gamesCollection.countDocuments(filter);
  console.log(`🔍 Found ${total} production game document(s) to inspect.\n`);

  let inspected = 0;
  let willChange = 0;
  let skipped = 0;
  let errors = 0;
  let usernameWarnings = 0;

  const bulkOps: object[] = [];

  const cursor = gamesCollection.find(filter).batchSize(BATCH_SIZE);

  for await (const doc of cursor) {
    inspected++;

    try {
      const ownerUsername = userPlatformMap.get(doc.userId)?.get(doc.platform);

      if (!ownerUsername && !doc.userPlayedAs) {
        usernameWarnings++;
        console.warn(
          `⚠️  No linked ${doc.platform} account for userId "${doc.userId}" ` +
            `(game: ${doc._id}). userPlayedAs will default to "black".`,
        );
      }

      const payload = buildUpdatePayload(doc, ownerUsername);

      if (!payload) {
        skipped++;
        continue;
      }

      willChange++;

      const update: Record<string, unknown> = { $set: payload.$set };
      if (Object.keys(payload.$unset).length > 0) {
        update.$unset = payload.$unset;
      }

      bulkOps.push({ updateOne: { filter: { _id: doc._id }, update } });

      if (bulkOps.length >= BATCH_SIZE && !isDryRun) {
        await gamesCollection.bulkWrite(bulkOps.splice(0) as any);
        process.stdout.write(`\r   ✍️  Processed ${inspected}/${total}...`);
      }
    } catch (err) {
      errors++;
      console.error(`\n❌ Error processing doc ${doc._id}:`, err);
    }
  }

  // Flush remaining batch
  if (bulkOps.length > 0 && !isDryRun) {
    await gamesCollection.bulkWrite(bulkOps as any);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n\n════════════════════════════════════════");
  console.log("  Migration 002 — Summary");
  console.log("════════════════════════════════════════");
  console.log(`  Total inspected : ${inspected}`);
  console.log(`  ${isDryRun ? "Would update" : "Updated"}     : ${willChange}`);
  console.log(`  Already current : ${skipped}`);
  console.log(`  Username warns  : ${usernameWarnings}`);
  console.log(`  Errors          : ${errors}`);
  console.log("════════════════════════════════════════");

  if (isDryRun) {
    console.log("\n  (No writes performed — remove --dry-run to apply.)");
  }

  await mongoose.disconnect();
  console.log("\n🏁 Done.");

  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
