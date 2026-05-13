import { Router } from "express";
import { db } from "@workspace/db";
import { customRivals } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : fallback;
}

// POST /api/rivals
router.post("/rivals", async (req, res) => {
  const { name, avatar, tone, aggression, logicLevel, humorLevel, difficulty, memoryEnabled, creatorDeviceId } =
    req.body as Record<string, unknown>;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  const validTones = ["calm", "aggressive", "sarcastic", "analytical"];
  const validDiffs = ["easy", "medium", "hard", "extreme"];

  try {
    let shareCode = generateShareCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const existing = await db.select({ id: customRivals.id }).from(customRivals).where(eq(customRivals.shareCode, shareCode)).limit(1);
      if (existing.length === 0) break;
      shareCode = generateShareCode();
    }

    const [rival] = await db
      .insert(customRivals)
      .values({
        shareCode,
        name: (name as string).trim().slice(0, 60),
        avatar: typeof avatar === "string" ? avatar.slice(0, 10) : "🤖",
        tone: validTones.includes(tone as string) ? (tone as string) : "aggressive",
        aggression: clampInt(aggression, 1, 10, 5),
        logicLevel: clampInt(logicLevel, 1, 10, 5),
        humorLevel: clampInt(humorLevel, 1, 10, 5),
        difficulty: validDiffs.includes(difficulty as string) ? (difficulty as string) : "medium",
        memoryEnabled: typeof memoryEnabled === "boolean" ? memoryEnabled : false,
        creatorDeviceId: typeof creatorDeviceId === "string" ? creatorDeviceId : null,
      })
      .returning();

    res.json({
      id: rival.id,
      shareCode: rival.shareCode,
      name: rival.name,
      avatar: rival.avatar,
      tone: rival.tone,
      aggression: rival.aggression,
      logicLevel: rival.logicLevel,
      humorLevel: rival.humorLevel,
      difficulty: rival.difficulty,
      memoryEnabled: rival.memoryEnabled,
    });
  } catch (err) {
    req.log.error({ err }, "rivals/create failed");
    res.status(500).json({ error: "Failed to create rival" });
  }
});

// GET /api/rivals/:code
router.get("/rivals/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const [rival] = await db
      .select()
      .from(customRivals)
      .where(eq(customRivals.shareCode, code.toUpperCase()))
      .limit(1);

    if (!rival) {
      res.status(404).json({ error: "Rival not found" });
      return;
    }

    db.update(customRivals)
      .set({ playCount: rival.playCount + 1 })
      .where(eq(customRivals.id, rival.id))
      .execute()
      .catch(() => {});

    res.json(rival);
  } catch (err) {
    req.log.error({ err }, "rivals/get failed");
    res.status(500).json({ error: "Failed to fetch rival" });
  }
});

export default router;
