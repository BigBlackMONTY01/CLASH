import { db, platformStats } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

const STAT_EPOCH = new Date("2026-06-15T00:00:00Z").getTime();
const STAT_BASE_DEBATES = 38;
const STAT_MS_PER_DEBATE = 12 * 60 * 60 * 1000;
const STAT_BASE_WIN_RATE_PCT = 58;
const STAT_BASE_TOPICS = 48;
const STAT_MS_PER_TOPIC = 24 * 60 * 60 * 1000;

function deterministicBaseline() {
  const elapsed = Math.max(0, Date.now() - STAT_EPOCH);
  const debates = STAT_BASE_DEBATES + Math.floor(elapsed / STAT_MS_PER_DEBATE);
  return {
    debates,
    wins: Math.round(debates * STAT_BASE_WIN_RATE_PCT / 100),
    topics: STAT_BASE_TOPICS + Math.floor(elapsed / STAT_MS_PER_TOPIC),
  };
}

let ensured = false;

export async function ensurePlatformStats(): Promise<void> {
  if (ensured) return;
  ensured = true;
  try {
    const existing = await db.select().from(platformStats).limit(1);
    if (existing.length === 0) {
      const base = deterministicBaseline();
      await db.insert(platformStats).values({
        totalDebates: base.debates,
        totalWins: base.wins,
        totalTopics: base.topics,
      });
      logger.info({ ...base }, "platform_stats: initialized with deterministic baseline");
    }
  } catch (err) {
    logger.error({ err }, "platform_stats: failed to ensure row");
    ensured = false;
  }
}

export async function incrementPlatformStats(isWin: boolean, isNewTopic: boolean): Promise<void> {
  try {
    await ensurePlatformStats();
    await db.update(platformStats).set({
      totalDebates: sql`${platformStats.totalDebates} + 1`,
      totalWins: isWin
        ? sql`${platformStats.totalWins} + 1`
        : sql`${platformStats.totalWins}`,
      totalTopics: isNewTopic
        ? sql`${platformStats.totalTopics} + 1`
        : sql`${platformStats.totalTopics}`,
      updatedAt: new Date(),
    });
  } catch (err) {
    logger.error({ err }, "platform_stats: failed to increment");
  }
}

export async function getPlatformStats(): Promise<{
  totalDebates: number;
  globalWinRate: number;
  uniqueTopics: number;
}> {
  try {
    await ensurePlatformStats();
    const rows = await db.select().from(platformStats).limit(1);
    if (rows[0] && rows[0].totalDebates > 0) {
      const { totalDebates, totalWins, totalTopics } = rows[0];
      return {
        totalDebates,
        globalWinRate: Math.round((totalWins / totalDebates) * 100),
        uniqueTopics: totalTopics,
      };
    }
  } catch (err) {
    logger.error({ err }, "platform_stats: failed to read");
  }
  const base = deterministicBaseline();
  return {
    totalDebates: base.debates,
    globalWinRate: STAT_BASE_WIN_RATE_PCT,
    uniqueTopics: base.topics,
  };
}
