/**
 * Migration 003 — Backfill userResult for games
 *
 * Populates `userResult` ("win" | "loss" | "draw") on all game documents
 * where `userResult` is absent.
 *
 * Runs atomic bulk operations using MongoDB updateMany pipeline / aggregation stages:
 *   1. result === "draw"            => "draw"
 *   2. result === doc.userPlayedAs  => "win"
 *   3. otherwise                    => "loss"
 *
 * Run with:
 *   npx tsx migrations/003_backfill_user_result.ts [--dry-run]
 */

import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({
  path: path.resolve(import.meta.dirname, "../.env"),
});

const MONGO_URI = process.env.MONGO_DB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_DB_URI is not set in the environment.");
  process.exit(1);
}

const isDryRun = process.argv.includes("--dry-run");

async function main() {
  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGO_URI!);
  console.log(`Connected.`);

  if (isDryRun) {
    console.log(`\n🔍 Running in DRY-RUN mode. No writes will be made.\n`);
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("No database instance found on mongoose connection.");
  }

  const gamesCollection = db.collection("games");

  const filterMissing = {
    $or: [
      { userResult: { $exists: false } },
      { userResult: null },
    ],
  };

  const total = await gamesCollection.countDocuments(filterMissing);
  console.log(`Found ${total} game(s) missing userResult.`);

  if (total === 0) {
    console.log("All games already have userResult. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  if (isDryRun) {
    console.log(`Dry run complete: ${total} documents would be updated.`);
    await mongoose.disconnect();
    return;
  }

  console.log(`Updating ${total} documents with atomic pipeline update...`);

  // Direct aggregation pipeline update in MongoDB 4.2+:
  // Computes userResult conditionally directly on the server without transferring 11k docs over the wire.
  const updateResult = await gamesCollection.updateMany(
    filterMissing,
    [
      {
        $set: {
          userResult: {
            $cond: {
              if: { $eq: ["$result", "draw"] },
              then: "draw",
              else: {
                $cond: {
                  if: { $eq: ["$result", "$userPlayedAs"] },
                  then: "win",
                  else: "loss",
                },
              },
            },
          },
        },
      },
    ]
  );

  console.log("\n════════════════════════════════════════");
  console.log("  Migration 003 — Summary");
  console.log("════════════════════════════════════════");
  console.log(`  Matched documents  : ${updateResult.matchedCount}`);
  console.log(`  Modified documents : ${updateResult.modifiedCount}`);
  console.log("════════════════════════════════════════");

  await mongoose.disconnect();
  console.log("\n🏁 Done.");
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
