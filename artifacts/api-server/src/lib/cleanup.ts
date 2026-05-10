import { db, debates } from "@workspace/db";
import { lt } from "drizzle-orm";
import { logger } from "./logger";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

async function pruneOldDebates() {
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);
  try {
    const deleted = await db.delete(debates).where(lt(debates.createdAt, cutoff)).returning({ id: debates.id });
    if (deleted.length > 0) {
      logger.info({ count: deleted.length, cutoff }, "Weekly cleanup: pruned old debates");
    }
  } catch (err) {
    logger.error({ err }, "Weekly cleanup: failed to prune debates");
  }
}

export function startCleanupJob() {
  pruneOldDebates();
  setInterval(pruneOldDebates, 60 * 60 * 1000);
}
