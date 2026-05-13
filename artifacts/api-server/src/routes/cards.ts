import { Router } from "express";
import { db, cards, players } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
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

function calcRarity(score: number, won: boolean, streak: number, opponentMmr?: number, playerMmr?: number): string {
  if (score >= 95) return "Legendary";
  if (score >= 90 || (won && opponentMmr && playerMmr && opponentMmr > playerMmr + 200)) return "Epic";
  if (won && (streak >= 3 || score >= 80)) return "Rare";
  return "Common";
}

// POST /api/cards/generate — Generate and save a card after a debate
router.post("/cards/generate", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  const { debateId, opponentId, opponentName, topic, score, rank, bestQuote, won, streak } = req.body as Record<string, unknown>;

  if (!opponentId || !opponentName || !topic || score === undefined) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const rarity = calcRarity(
    Number(score),
    Boolean(won),
    Number(streak) || 0,
  );

  try {
    const card = await db.insert(cards).values({
      playerId,
      debateId: debateId ? Number(debateId) : null,
      opponentId: String(opponentId),
      opponentName: String(opponentName),
      topic: String(topic),
      score: Number(score),
      rank: String(rank || "C"),
      rarity,
      bestQuote: String(bestQuote || ""),
    }).returning();

    res.json(card[0]);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// GET /api/cards/collection — Get player's card collection
router.get("/cards/collection", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  try {
    const collection = await db.select().from(cards)
      .where(eq(cards.playerId, playerId))
      .orderBy(desc(cards.createdAt))
      .limit(100);
    res.json(collection);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

export default router;
