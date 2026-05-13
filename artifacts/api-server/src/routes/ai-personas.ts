import { Router } from "express";
import { db, aiPersonas, aiMemory } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";
import { randomBytes } from "crypto";

const router = Router();

function getJwtPlayerId(authHeader: string | undefined): number | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { playerId: number };
    return payload.playerId ?? null;
  } catch { return null; }
}

// POST /api/personas/create — Create a custom AI persona
router.post("/personas/create", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  const { name, avatar, tone, aggression, logicLevel, humorLevel, difficulty, memoryEnabled } =
    req.body as Record<string, unknown>;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name required" });
    return;
  }

  const shareCode = randomBytes(4).toString("hex").toUpperCase();

  try {
    const persona = await db.insert(aiPersonas).values({
      playerId,
      name: String(name).slice(0, 40),
      avatar: String(avatar || "🤖").slice(0, 4),
      tone: String(tone || "aggressive").slice(0, 20),
      aggression: Math.min(10, Math.max(1, Number(aggression) || 5)),
      logicLevel: Math.min(10, Math.max(1, Number(logicLevel) || 5)),
      humorLevel: Math.min(10, Math.max(1, Number(humorLevel) || 3)),
      difficulty: ["easy", "medium", "hard", "extreme"].includes(String(difficulty)) ? String(difficulty) : "medium",
      memoryEnabled: Boolean(memoryEnabled),
      shareCode,
    }).returning();

    res.json(persona[0]);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// GET /api/personas/my — Get player's custom personas
router.get("/personas/my", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  try {
    const personas = await db.select().from(aiPersonas).where(eq(aiPersonas.playerId, playerId));
    res.json(personas);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// GET /api/personas/share/:code — Get a shared persona by code
router.get("/personas/share/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const persona = await db.select().from(aiPersonas).where(eq(aiPersonas.shareCode, code)).limit(1);
    if (persona.length === 0) { res.status(404).json({ error: "Persona not found" }); return; }
    res.json(persona[0]);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// POST /api/personas/:id/memory — Update AI memory after a match
router.post("/personas/:id/memory", async (req, res) => {
  const playerId = getJwtPlayerId(req.headers.authorization);
  if (!playerId) { res.status(401).json({ error: "Auth required" }); return; }

  const personaId = Number(req.params.id);
  const { patternSummary } = req.body as Record<string, unknown>;

  if (!patternSummary || typeof patternSummary !== "string") {
    res.status(400).json({ error: "patternSummary required" });
    return;
  }

  try {
    const existing = await db.select().from(aiMemory)
      .where(and(eq(aiMemory.personaId, personaId), eq(aiMemory.playerId, playerId)))
      .limit(1);

    if (existing.length === 0) {
      const created = await db.insert(aiMemory).values({ personaId, playerId, patternSummary }).returning();
      res.json(created[0]);
    } else {
      const updated = await db.update(aiMemory)
        .set({ patternSummary, updatedAt: new Date() })
        .where(and(eq(aiMemory.personaId, personaId), eq(aiMemory.playerId, playerId)))
        .returning();
      res.json(updated[0]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// Build personality string from persona for use in debate
router.get("/personas/:id/personality", async (req, res) => {
  const personaId = Number(req.params.id);
  try {
    const persona = await db.select().from(aiPersonas).where(eq(aiPersonas.id, personaId)).limit(1);
    if (persona.length === 0) { res.status(404).json({ error: "Not found" }); return; }

    const p = persona[0];
    const aggressionDesc = p.aggression >= 8 ? "extremely aggressive, relentless, brutal" : p.aggression >= 6 ? "assertive, confrontational" : p.aggression >= 4 ? "balanced, firm" : "calm, measured";
    const logicDesc = p.logicLevel >= 8 ? "uses rigorous logic, demands evidence, calls out every fallacy" : p.logicLevel >= 5 ? "uses solid reasoning" : "relies more on intuition and feeling";
    const humorDesc = p.humorLevel >= 7 ? "frequently uses sharp wit and sarcasm" : p.humorLevel >= 4 ? "occasionally uses dry humor" : "mostly serious";

    const personality = `You are ${p.name} ${p.avatar} — a custom AI debate opponent.
Tone: ${p.tone}. Style: ${aggressionDesc}. Logic level: ${logicDesc}. Humor: ${humorDesc}.
Difficulty: ${p.difficulty}.
Always stay in character. Never break this persona.`;

    res.json({ personality, persona: p });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

export default router;
