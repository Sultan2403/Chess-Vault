/**
 * Migration 001 — Delete all test-user documents
 *
 * Removes every document from the `games` collection where `userId` is not a
 * real Clerk user ID. Real Clerk IDs always start with the prefix "user_".
 * Any document whose userId does NOT start with "user_" is considered test/junk
 * data and is permanently deleted.
 *
 * Run with:
 *   npx tsx Backend/migrations/001_delete_test_users.ts
 * or from the Backend directory:
 *   npx tsx migrations/001_delete_test_users.ts
 *
 * Add --dry-run to preview without deleting.
 */

import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Bootstrap env — resolve .env relative to the Backend directory
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI!);
  console.log("✅ Connected.\n");

  const db = mongoose.connection.db!;
  const gamesCollection = db.collection("games");

  // Real Clerk user IDs always start with "user_".
  const testUserFilter = { userId: { $not: /^user_/ } };

  const count = await gamesCollection.countDocuments(testUserFilter);
  console.log(`🔍 Found ${count} game document(s) with non-Clerk userId.`);

  if (count === 0) {
    console.log("✅ Nothing to delete. Exiting.");
    await mongoose.disconnect();
    return;
  }

  if (isDryRun) {
    console.log("\n⚠️  DRY RUN — no documents will be deleted.");
    console.log(`   Would delete ${count} document(s).`);

    // Show a sample of the affected userIds for verification
    const sample = await gamesCollection
      .find(testUserFilter, { projection: { userId: 1, platform: 1, title: 1 } })
      .limit(10)
      .toArray();

    console.log("\n   Sample of documents that would be deleted:");
    sample.forEach((doc) => {
      console.log(
        `   - _id: ${doc._id}  userId: "${doc.userId}"  platform: ${doc.platform}  title: "${doc.title}"`,
      );
    });
    await mongoose.disconnect();
    return;
  }

  console.log(`\n🗑️  Deleting ${count} test-user document(s)...`);
  const result = await gamesCollection.deleteMany(testUserFilter);
  console.log(`✅ Deleted ${result.deletedCount} document(s).`);

  await mongoose.disconnect();
  console.log("\n🏁 Done.");
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
