import { Router } from "express";
import { db, players, debates, shieldTokens, signatureTitles, dynasty } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";

const router = Router();

function getJwtPlayerId(authHeader: string | undefined): number | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { playerId: number };
    return payload.playerId ?? null;
  } catch { return null; }
}

// POST /api/progression/post-debate — Run all post-debate progression logic
router.post("/progression/post-debate", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  const { won, opponentId, opponentName, streak, totalDebates, avgLogic, avgPersuasion, avgDelivery } =
    req.body as Record<string, unknown>;

  const results: Record<string, unknown> = {};

  try {
    // === STREAK SHIELD (Phase 8) ===
    if (won && Number(streak) === 5) {
      const existing = await db.select().from(shieldTokens).where(eq(shieldTokens.playerId, playerId)).limit(1);
      if (existing.length === 0) {
        await db.insert(shieldTokens).values({ playerId, count: 1, lastGrantedAt: new Date() });
        results.shieldGranted = true;
        results.shieldCount = 1;
      } else if (existing[0].count < 2) {
        await db.update(shieldTokens)
          .set({ count: existing[0].count + 1, lastGrantedAt: new Date(), updatedAt: new Date() })
          .where(eq(shieldTokens.playerId, playerId));
        results.shieldGranted = true;
        results.shieldCount = existing[0].count + 1;
      }
    }

    // === SHIELD CONSUMPTION on loss ===
    if (!won) {
      const shield = await db.select().from(shieldTokens).where(eq(shieldTokens.playerId, playerId)).limit(1);
      if (shield.length > 0 && shield[0].count > 0) {
        await db.update(shieldTokens)
          .set({ count: shield[0].count - 1, updatedAt: new Date() })
          .where(eq(shieldTokens.playerId, playerId));
        results.shieldConsumed = true;
        results.shieldCount = shield[0].count - 1;
      }
    }

    // === DEBATE DYNASTY (Phase 9) ===
    if (opponentId && opponentName) {
      const existing = await db.select().from(dynasty)
        .where(and(eq(dynasty.playerId, playerId), eq(dynasty.opponentId, String(opponentId))))
        .limit(1);

      if (existing.length === 0) {
        const created = await db.insert(dynasty).values({
          playerId,
          opponentId: String(opponentId),
          opponentName: String(opponentName),
          wins: won ? 1 : 0,
          losses: won ? 0 : 1,
        }).returning();
        results.dynasty = created[0];
      } else {
        const updated = await db.update(dynasty)
          .set({
            wins: won ? existing[0].wins + 1 : existing[0].wins,
            losses: won ? existing[0].losses : existing[0].losses + 1,
            updatedAt: new Date(),
          })
          .where(eq(dynasty.id, existing[0].id))
          .returning();
        results.dynasty = updated[0];

        if (won && updated[0].wins === 10) {
          results.nemesisBadge = { opponentId, opponentName };
        }
        if (!won && updated[0].losses >= 5 && updated[0].wins === 0) {
          results.rivalTag = { opponentId, opponentName };
        }
      }
    }

    // === SIGNATURE TITLE (Phase 7) — after 5+ debates ===
    if (Number(totalDebates) >= 5) {
      try {
        const recentDebates = await db.select({
          avgLogic: debates.avgLogic,
          avgPersuasion: debates.avgPersuasion,
          avgDelivery: debates.avgDelivery,
          won: debates.won,
          avgScore: debates.avgScore,
        }).from(debates)
          .where(eq(debates.playerId, playerId))
          .orderBy(desc(debates.createdAt))
          .limit(10);

        if (recentDebates.length >= 5) {
          const avgL = recentDebates.reduce((s, d) => s + d.avgLogic, 0) / recentDebates.length;
          const avgP = recentDebates.reduce((s, d) => s + d.avgPersuasion, 0) / recentDebates.length;
          const avgDv = recentDebates.reduce((s, d) => s + d.avgDelivery, 0) / recentDebates.length;
          const winRate = recentDebates.filter(d => d.won).length / recentDebates.length;
          const scores = recentDebates.map(d => d.avgScore);
          const variance = scores.reduce((s, v) => s + Math.pow(v - (scores.reduce((a, b) => a + b, 0) / scores.length), 2), 0) / scores.length;

          let title = "Scrapper";
          if (avgL >= 72 && avgL > avgP + 8) title = "Evidence Machine";
          else if (avgP >= 72 && avgP > avgL + 8) title = "The Pivot";
          else if (variance > 200) title = "Chaos Agent";
          else if (recentDebates.slice(0, 3).every(d => d.avgScore < 60) && recentDebates.slice(-3).every(d => d.avgScore >= 65)) title = "Avalanche";
          else if (avgDv >= 75 && winRate >= 0.6) title = "Sniper";

          const existing = await db.select().from(signatureTitles).where(eq(signatureTitles.playerId, playerId)).limit(1);
          if (existing.length === 0) {
            await db.insert(signatureTitles).values({ playerId, title });
          } else if (existing[0].title !== title) {
            await db.update(signatureTitles)
              .set({ title, assignedAt: new Date() })
              .where(eq(signatureTitles.playerId, playerId));
          }
          results.signatureTitle = title;
        }
      } catch { /* non-critical */ }
    }

    // Get current shield count for response
    const shieldRow = await db.select().from(shieldTokens).where(eq(shieldTokens.playerId, playerId)).limit(1);
    results.currentShieldCount = shieldRow[0]?.count ?? 0;

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// GET /api/progression/status — Get player's progression status
router.get("/progression/status", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  try {
    const [shieldRow, titleRow, dynastyRows] = await Promise.all([
      db.select().from(shieldTokens).where(eq(shieldTokens.playerId, playerId)).limit(1),
      db.select().from(signatureTitles).where(eq(signatureTitles.playerId, playerId)).limit(1),
      db.select().from(dynasty).where(eq(dynasty.playerId, playerId)).orderBy(desc(dynasty.wins)),
    ]);

    res.json({
      shieldTokens: shieldRow[0]?.count ?? 0,
      signatureTitle: titleRow[0]?.title ?? null,
      dynasty: dynastyRows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// GET /api/progression/dynasty — Get dynasty records
router.get("/progression/dynasty", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  try {
    const rows = await db.select().from(dynasty)
      .where(eq(dynasty.playerId, playerId))
      .orderBy(desc(dynasty.wins));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

export default router;
