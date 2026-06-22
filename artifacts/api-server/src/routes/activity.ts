import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { incrementPlatformStats } from "../lib/stats.js";
import { logger } from "../lib/logger.js";

const router = Router();

const FAKE_INTERVAL_MIN_MS = 2 * 60 * 1000;
const FAKE_INTERVAL_MAX_MS = 30 * 60 * 1000;
const MAX_FAKE_ROWS = 4;
const REAL_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

const FAKE_USERS = [
  "mr_counterpoint", "gg_no_rebuttal", "SocraticSlap", "DebateDave_",
  "HotTakeHannah", "TakeItOrLeave", "LogicBro99", "PhilosophyKing",
  "FactDropper", "DebunkThis", "RebuttalKing", "CriticalMass_",
];
const FAKE_OPPONENTS = [
  "The Debunker", "The Prosecutor", "The Professor",
  "The Contrarian", "The Analyst", "The Realist",
];
const FAKE_TOPICS = [
  "Affirmative action is necessary",
  "Cancel culture has gone too far",
  "Free will is an illusion",
  "AI will do more good than harm",
  "Social media does more harm than good",
  "The death penalty should be abolished",
  "Climate change requires radical action",
  "Privacy is more important than security",
  "Universal basic income would help society",
  "Space exploration is worth the cost",
  "Meritocracy is a myth",
  "Democracy is in decline worldwide",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFakeEntry(): { text: string; badge: string; icon: string; topic: string | null } {
  const rand = Math.random();
  if (rand < 0.15) {
    const streak = 3 + Math.floor(Math.random() * 5);
    return { text: `${pick(FAKE_USERS)} is on a ${streak}-win streak`, badge: "STREAK", icon: "bolt", topic: null };
  } else if (rand < 0.55) {
    const topic = pick(FAKE_TOPICS);
    return { text: `${pick(FAKE_USERS)} lost to ${pick(FAKE_OPPONENTS)} · "${topic}"`, badge: "LOSS", icon: "skull", topic };
  } else {
    const pts = 60 + Math.floor(Math.random() * 36);
    const topic = pick(FAKE_TOPICS);
    return { text: `${pick(FAKE_USERS)} won against ${pick(FAKE_OPPONENTS)} · ${pts} pts`, badge: "WIN", icon: "trophy", topic };
  }
}

function randomFakeInterval(): number {
  return FAKE_INTERVAL_MIN_MS + Math.random() * (FAKE_INTERVAL_MAX_MS - FAKE_INTERVAL_MIN_MS);
}

async function generateFakeEntryJob(): Promise<void> {
  try {
    const entry = generateFakeEntry();
    await db.execute(sql`
      INSERT INTO activity_events (text, badge, icon, topic, is_fake)
      VALUES (${entry.text}, ${entry.badge}, ${entry.icon}, ${entry.topic ?? null}, true)
    `);
    incrementPlatformStats(entry.badge === "WIN", entry.topic !== null).catch(() => {});
    await db.execute(sql`
      DELETE FROM activity_events
      WHERE is_fake = true
      AND id NOT IN (
        SELECT id FROM activity_events
        WHERE is_fake = true
        ORDER BY created_at DESC
        LIMIT ${MAX_FAKE_ROWS}
      )
    `);
    logger.info("activity: inserted fake entry");
  } catch (err) {
    logger.error({ err }, "activity: fake entry job failed");
  }
}

function scheduleFakeEntryJob(): void {
  setTimeout(async () => {
    await generateFakeEntryJob();
    scheduleFakeEntryJob();
  }, randomFakeInterval());
}

let jobStarted = false;

export async function startFakeEntryJob(): Promise<void> {
  if (jobStarted) return;
  jobStarted = true;
  try {
    const result = await db.execute(sql`SELECT COUNT(*) AS cnt FROM activity_events WHERE is_fake = true`);
    const rows = (result as any).rows ?? result;
    const count = Number(rows[0]?.cnt ?? 0);
    if (count === 0) {
      await generateFakeEntryJob();
    }
  } catch {
    await generateFakeEntryJob().catch(() => {});
  }
  scheduleFakeEntryJob();
}

// GET /api/activity/recent — returns latest activity entries (mix of fake and real)
router.get("/activity/recent", async (req, res) => {
  startFakeEntryJob().catch(() => {});

  try {
    // Occasionally purge real entries older than 7 days
    if (Math.random() < 0.1) {
      db.execute(sql`
        DELETE FROM activity_events
        WHERE is_fake = false
        AND created_at < ${new Date(Date.now() - REAL_RETENTION_MS)}
      `).catch(() => {});
    }

    const result = await db.execute(sql`
      SELECT id, text, badge, icon, topic, created_at AS "createdAt"
      FROM activity_events
      ORDER BY created_at DESC
      LIMIT 6
    `);
    const rows = (result as any).rows ?? result;
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "activity/recent failed");
    res.json([]);
  }
});

export default router;
