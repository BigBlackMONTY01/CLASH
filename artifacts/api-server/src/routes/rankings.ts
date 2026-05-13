import { Router } from "express";
import { db, players, debates, rankings, seasons } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";

const router = Router();

function getJwtPlayerId(authHeader: string | undefined): number | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { playerId: number };
    return payload.playerId ?? null;
  } catch {
    return null;
  }
}

const MMR_THRESHOLDS: Record<string, number> = {
  Bronze: 0,
  Silver: 1200,
  Gold: 1500,
  Diamond: 1800,
  "Clash Master": 2100,
};

function mmrToRank(mmr: number): string {
  if (mmr >= 2100) return "Clash Master";
  if (mmr >= 1800) return "Diamond";
  if (mmr >= 1500) return "Gold";
  if (mmr >= 1200) return "Silver";
  return "Bronze";
}

function calcMmrChange(won: boolean, playerMmr: number, opponentMmr: number): number {
  const rankDiff = opponentMmr - playerMmr;
  if (won) {
    const base = 25;
    const bonus = Math.max(0, Math.min(15, Math.floor(rankDiff / 100)));
    return base + bonus;
  } else {
    const base = -20;
    const penalty = rankDiff < -200 ? -15 : 0;
    return base + penalty;
  }
}

async function getOrCreateSeason(): Promise<number> {
  try {
    const active = await db.select().from(seasons).where(eq(seasons.isActive, 1)).limit(1);
    if (active.length > 0) return active[0].id;

    const now = new Date();
    const end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const inserted = await db.insert(seasons).values({
      name: `Season ${Math.floor(now.getTime() / (90 * 24 * 60 * 60 * 1000))}`,
      startDate: now,
      endDate: end,
      isActive: 1,
    }).returning();
    return inserted[0].id;
  } catch {
    return 1;
  }
}

// GET /api/rankings/me — Get current player's MMR and rank
router.get("/rankings/me", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  try {
    const seasonId = await getOrCreateSeason();
    const existing = await db.select().from(rankings)
      .where(and(eq(rankings.playerId, playerId), eq(rankings.seasonId, seasonId)))
      .limit(1);

    if (existing.length === 0) {
      const created = await db.insert(rankings).values({
        playerId, seasonId, mmr: 1000, rank: "Bronze", wins: 0, losses: 0, peakMmr: 1000,
      }).returning();
      res.json(created[0]);
      return;
    }
    res.json(existing[0]);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// POST /api/rankings/update — Update MMR after a debate
router.post("/rankings/update", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  const { won, opponentId } = req.body as Record<string, unknown>;
  if (typeof won !== "boolean") { res.status(400).json({ error: "won required" }); return; }

  try {
    const seasonId = await getOrCreateSeason();

    let playerRanking = await db.select().from(rankings)
      .where(and(eq(rankings.playerId, playerId), eq(rankings.seasonId, seasonId)))
      .limit(1);

    if (playerRanking.length === 0) {
      const created = await db.insert(rankings).values({
        playerId, seasonId, mmr: 1000, rank: "Bronze", wins: 0, losses: 0, peakMmr: 1000,
      }).returning();
      playerRanking = created;
    }

    const current = playerRanking[0];
    const opponentMmr = 1000;

    const mmrDelta = calcMmrChange(won, current.mmr, opponentMmr);
    const newMmr = Math.max(0, current.mmr + mmrDelta);
    const newRank = mmrToRank(newMmr);
    const newPeak = Math.max(current.peakMmr, newMmr);
    const newWins = won ? current.wins + 1 : current.wins;
    const newLosses = won ? current.losses : current.losses + 1;
    const rankUp = newRank !== current.rank && MMR_THRESHOLDS[newRank] > MMR_THRESHOLDS[current.rank];

    await db.update(rankings)
      .set({ mmr: newMmr, rank: newRank, peakMmr: newPeak, wins: newWins, losses: newLosses, updatedAt: new Date() })
      .where(eq(rankings.id, current.id));

    res.json({
      mmr: newMmr, rank: newRank, peakMmr: newPeak, mmrDelta,
      wins: newWins, losses: newLosses, rankUp,
      prevRank: current.rank,
      nextRankThreshold: Object.entries(MMR_THRESHOLDS).find(([r]) => MMR_THRESHOLDS[r] > newMmr)?.[1] ?? null,
      nextRankName: Object.entries(MMR_THRESHOLDS).find(([r]) => MMR_THRESHOLDS[r] > newMmr)?.[0] ?? "Clash Master",
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// GET /api/rankings/leaderboard — MMR leaderboard
router.get("/rankings/leaderboard", async (_req, res) => {
  try {
    const seasonId = await getOrCreateSeason();
    const rows = await db
      .select({
        playerId: rankings.playerId,
        mmr: rankings.mmr,
        rank: rankings.rank,
        wins: rankings.wins,
        losses: rankings.losses,
        peakMmr: rankings.peakMmr,
        username: players.username,
        deviceId: players.deviceId,
      })
      .from(rankings)
      .leftJoin(players, eq(rankings.playerId, players.id))
      .where(eq(rankings.seasonId, seasonId))
      .orderBy(desc(rankings.mmr))
      .limit(25);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

export default router;
