import { db, debates, seasons } from "@workspace/db";
import { lt, eq } from "drizzle-orm";
import { logger } from "./logger";

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

async function pruneOldDebates() {
  const cutoff = new Date(Date.now() - FOURTEEN_DAYS_MS);
  try {
    const deleted = await db.delete(debates).where(lt(debates.createdAt, cutoff)).returning({ id: debates.id });
    if (deleted.length > 0) {
      logger.info({ count: deleted.length, cutoff }, "Cleanup: pruned debates older than 14 days");
    }
  } catch (err) {
    logger.error({ err }, "Cleanup: failed to prune old debates");
  }
}

async function maybeResetSeason() {
  try {
    const active = await db.select().from(seasons).where(eq(seasons.isActive, 1)).limit(1);

    if (active.length === 0) {
      const now = new Date();
      const end = new Date(now.getTime() + TWO_WEEKS_MS);
      await db.insert(seasons).values({
        name: `Season ${Math.ceil(now.getTime() / TWO_WEEKS_MS)}`,
        startDate: now,
        endDate: end,
        isActive: 1,
      });
      logger.info("Season reset: no active season found, created a new one");
      return;
    }

    const current = active[0];
    const now = new Date();

    if (now < new Date(current.endDate)) {
      return;
    }

    await db.update(seasons).set({ isActive: 0 }).where(eq(seasons.id, current.id));

    const end = new Date(now.getTime() + TWO_WEEKS_MS);
    const inserted = await db.insert(seasons).values({
      name: `Season ${Math.ceil(now.getTime() / TWO_WEEKS_MS)}`,
      startDate: now,
      endDate: end,
      isActive: 1,
    }).returning();

    logger.info(
      { oldSeasonId: current.id, newSeasonId: inserted[0].id },
      "Season reset: archived old season, created new season — only rankings reset, all player data preserved"
    );
  } catch (err) {
    logger.error({ err }, "Season reset: failed");
  }
}

export function startCleanupJob() {
  pruneOldDebates();
  maybeResetSeason();

  setInterval(pruneOldDebates, 60 * 60 * 1000);
  setInterval(maybeResetSeason, 60 * 60 * 1000);
}
