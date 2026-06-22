import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

import { logger } from "../lib/logger.js";

const router = Router();

const FAKE_INTERVAL_MIN_MS = 10 * 60 * 1000;
const FAKE_INTERVAL_MAX_MS = 20 * 60 * 1000;
const MAX_FAKE_ROWS = 20;
const REAL_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

const FAKE_USERS = [
  "PlatoBro", "PhilBuster99", "CriticalMass7", "SharptakE", "mr_counterpoint",
  "gg_no_rebuttal", "SocraticSlap", "DebateDave_", "HotTakeHannah", "TakeItOrLeave",
  "LogicBro99", "PhilosophyKing", "FactDropper", "DebunkThis", "RebuttalKing",
  "NuanceNinja", "RhetoricRaj", "kira_debates", "SyllogismSam", "BurdenOfProof",
  "FallacyFinder", "contrarian_irl", "ArgueKing88", "xoxodebater", "LogicLord",
  "steelmanner", "NotYourFallacy", "EthosPathosBro", "WrongOpinions", "rebuttal_exe",
  "JustAskingQ", "CriticalHit99", "DialecticalDave", "CounterPunchR", "PremisePusher",
  "SoundArgument", "ThesisKing", "DebateMe_IRL", "DevilsAdvocate", "SteelManning",
];

const FAKE_OPPONENTS = [
  "The Professor", "The Prosecutor", "The Philosopher",
  "The Politician", "The Devil", "The Debunker",
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
  "Billionaires should not exist",
  "War is never justified",
  "Religion does more harm than good",
  "Automation will destroy jobs",
  "Capitalism needs to be replaced",
  "Free speech has no limits",
  "Drugs should be decriminalized",
  "Nuclear energy is the future",
  "Prisons do more harm than good",
  "AI will make humans obsolete",
  "Veganism is a moral obligation",
  "Social media should be regulated",
  "The US should have open borders",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedScore(): number {
  const r = Math.random();
  if (r < 0.10) return 40 + Math.floor(Math.random() * 15);
  if (r < 0.35) return 55 + Math.floor(Math.random() * 10);
  if (r < 0.70) return 65 + Math.floor(Math.random() * 11);
  if (r < 0.90) return 76 + Math.floor(Math.random() * 10);
  return 86 + Math.floor(Math.random() * 10);
}

function generateFakeEntry(): { text: string; badge: string; icon: string; topic: string | null } {
  const player = pick(FAKE_USERS);
  const opponent = pick(FAKE_OPPONENTS);
  const topic = pick(FAKE_TOPICS);
  const rand = Math.random();

  if (rand < 0.05) {
    return { text: `${player} completed a full Gauntlet run`, badge: "GAUNTLET", icon: "bolt", topic: null };
  }
  if (rand < 0.10) {
    const streak = 3 + Math.floor(Math.random() * 5);
    return { text: `${player} is on a ${streak}-win streak`, badge: "STREAK", icon: "bolt", topic: null };
  }
  if (rand < 0.15) {
    return { text: `${player} collapsed against ${opponent} · "${topic}"`, badge: "COLLAPSE", icon: "skull", topic };
  }
  if (rand < 0.55) {
    return { text: `${player} lost to ${opponent} · "${topic}"`, badge: "LOSS", icon: "skull", topic };
  }
  const score = weightedScore();
  return { text: `${player} won against ${opponent} · ${score} pts`, badge: "WIN", icon: "trophy", topic };
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
    const needed = Math.max(0, MAX_FAKE_ROWS - count);
    for (let i = 0; i < needed; i++) {
      await generateFakeEntryJob().catch(() => {});
    }
  } catch {
    await generateFakeEntryJob().catch(() => {});
  }
  scheduleFakeEntryJob();
}

// GET /api/activity/recent — real entries always shown, fakes fill remaining slots, newest first
router.get("/activity/recent", async (req, res) => {
  startFakeEntryJob().catch(() => {});

  try {
    if (Math.random() < 0.1) {
      db.execute(sql`
        DELETE FROM activity_events
        WHERE is_fake = false
        AND created_at < ${new Date(Date.now() - REAL_RETENTION_MS)}
      `).catch(() => {});
    }

    const [realResult, fakeResult] = await Promise.all([
      db.execute(sql`
        SELECT id, text, badge, icon, topic, created_at AS "createdAt"
        FROM activity_events
        WHERE is_fake = false
        ORDER BY created_at DESC
        LIMIT 5
      `),
      db.execute(sql`
        SELECT id, text, badge, icon, topic, created_at AS "createdAt"
        FROM activity_events
        WHERE is_fake = true
        ORDER BY created_at DESC
        LIMIT 10
      `),
    ]);

    const realRows: any[] = (realResult as any).rows ?? realResult;
    const fakeRows: any[] = (fakeResult as any).rows ?? fakeResult;
    const fakeFill = fakeRows.slice(0, Math.max(4, 12 - realRows.length));

    const merged = [...realRows, ...fakeFill]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);

    res.json(merged);
  } catch (err) {
    req.log.error({ err }, "activity/recent failed");
    res.json([]);
  }
});

export default router;
