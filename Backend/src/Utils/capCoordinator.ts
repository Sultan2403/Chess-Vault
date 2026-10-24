import { redis } from "../DB/Connections/redis";
import { logger } from "../Config/logger";

const CAP_KEY_PREFIX = "import:cap:";
const CAP_KEY_TTL_SECONDS = 3600; // 1 hour safety TTL

export const capCoordinator = {
  getCapKey(userId: string): string {
    return `${CAP_KEY_PREFIX}${userId}`;
  },

  /**
   * Initialize or seed the user's current game count in Redis if not already cached.
   */
  async initUserCap(userId: string, currentCount: number): Promise<void> {
    const key = this.getCapKey(userId);
    // set with NX so we don't overwrite if another concurrent process seeded it
    await redis.set(key, currentCount, "EX", CAP_KEY_TTL_SECONDS, "NX");
  },

  /**
   * Atomically reserve room for up to `requested` games against `limit`.
   * Returns how many games are allowed in this batch, and whether the user is now capped.
   */
  async reserveCapacity(
    userId: string,
    requested: number,
    limit: number,
  ): Promise<{ allowedCount: number; isCapped: boolean }> {
    if (requested <= 0) {
      return { allowedCount: 0, isCapped: false };
    }

    const key = this.getCapKey(userId);
    const newTotal = await redis.incrby(key, requested);
    await redis.expire(key, CAP_KEY_TTL_SECONDS);

    if (newTotal <= limit) {
      return { allowedCount: requested, isCapped: false };
    }

    // Overshot the limit
    const overage = newTotal - limit;
    const allowedCount = Math.max(0, requested - overage);

    if (overage > 0) {
      await redis.decrby(key, overage);
    }

    logger.info(
      { userId, requested, limit, newTotal, allowedCount },
      "Import cap ceiling reached",
    );

    return { allowedCount, isCapped: true };
  },

  /**
   * Refund unused capacity (e.g. duplicates that did not actually increase the DB count).
   */
  async reconcileCapacity(
    userId: string,
    unusedCount: number,
  ): Promise<void> {
    if (unusedCount <= 0) return;
    const key = this.getCapKey(userId);
    await redis.decrby(key, unusedCount);
  },

  /**
   * Remove the key once all active imports for this user complete.
   */
  async clearUserCap(userId: string): Promise<void> {
    const key = this.getCapKey(userId);
    await redis.del(key);
  },
};
