import { Router } from "express";
import { db, players, debates } from "@workspace/db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";

function getJwtPlayerId(authHeader: string | undefined): number | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { playerId: number };
    return payload.playerId ?? null;
  } catch {
    return null;
  }
}

// Only original columns — safe against production DBs that haven't run db:push for new nullable columns
const SAFE_PLAYER_COLS = {
  id: players.id,
  deviceId: players.deviceId,
  username: players.username,
  currentStreak: players.currentStreak,
  bestStreak: players.bestStreak,
  avatarId: players.avatarId,
  accentColor: players.accentColor,
  cardBg: players.cardBg,
  soundPack: players.soundPack,
  createdAt: players.createdAt,
  updatedAt: players.updatedAt,
};

const router = Router();

// POST /api/players/register — create or fetch player by device ID
router.post("/players/register", async (req, res) => {
  const { deviceId } = req.body as Record<string, unknown>;
  if (!deviceId || typeof deviceId !== "string") {
    res.status(400).json({ error: "deviceId required" });
    return;
  }
  try {
    const existing = await db.select(SAFE_PLAYER_COLS).from(players).where(eq(players.deviceId, deviceId)).limit(1);
    if (existing.length > 0) {
      await db.update(players).set({ updatedAt: new Date() }).where(eq(players.deviceId, deviceId));
      res.json(existing[0]);
      return;
    }
    try {
      const inserted = await db.insert(players).values({ deviceId }).returning(SAFE_PLAYER_COLS);
      res.json(inserted[0]);
    } catch (insertErr: any) {
      if (insertErr?.code === "23505") {
        const found = await db.select(SAFE_PLAYER_COLS).from(players).where(eq(players.deviceId, deviceId)).limit(1);
        if (found.length > 0) { res.json(found[0]); return; }
      }
      throw insertErr;
    }
  } catch (err: any) {
    req.log.error({ err }, "players/register failed");
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// PATCH /api/players/preferences — save per-account customisation (avatar, accent, cardBg, soundPack)
router.patch("/players/preferences", async (req, res) => {
  const { avatarId, accentColor, cardBg, soundPack } = req.body as Record<string, unknown>;
  try {
    const jwtPlayerId = getJwtPlayerId(req.headers.authorization);
    if (!jwtPlayerId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof avatarId === "string") updates.avatarId = avatarId;
    if (typeof accentColor === "string") updates.accentColor = accentColor;
    if (typeof cardBg === "string") updates.cardBg = cardBg;
    if (typeof soundPack === "string") updates.soundPack = soundPack;
    const updated = await db.update(players).set(updates).where(eq(players.id, jwtPlayerId)).returning(SAFE_PLAYER_COLS);
    if (updated.length === 0) {
      res.status(404).json({ error: "Player not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err: any) {
    req.log.error({ err }, "players/preferences failed");
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// PATCH /api/players/username — set or update username (supports JWT auth or deviceId)
router.patch("/players/username", async (req, res) => {
  const { deviceId, username } = req.body as Record<string, unknown>;
  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "username required" });
    return;
  }
  const trimmed = username.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 20);
  if (trimmed.length < 2) {
    res.status(400).json({ error: "Invalid username — use 2–20 letters, numbers, or underscores" });
    return;
  }
  try {
    const jwtPlayerId = getJwtPlayerId(req.headers.authorization);

    let ownerId: number | null = null;
    if (jwtPlayerId) {
      const rows = await db.select({ id: players.id }).from(players).where(eq(players.id, jwtPlayerId)).limit(1);
      if (rows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }
      ownerId = rows[0].id;
    } else {
      if (!deviceId || typeof deviceId !== "string") {
        res.status(400).json({ error: "deviceId required when not authenticated" });
        return;
      }
      const rows = await db.select({ id: players.id }).from(players).where(eq(players.deviceId, deviceId)).limit(1);
      if (rows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }
      ownerId = rows[0].id;
    }

    const existing = await db
      .select({ id: players.id })
      .from(players)
      .where(sql`lower(${players.username}) = lower(${trimmed}) and ${players.id} <> ${ownerId}`)
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }

    const updated = await db
      .update(players)
      .set({ username: trimmed, updatedAt: new Date() })
      .where(eq(players.id, ownerId))
      .returning(SAFE_PLAYER_COLS);

    if (updated.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err: any) {
    const msg = err?.message || "";
    if (err?.code === "23505" || msg.includes("duplicate key") || msg.includes("unique constraint")) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }
    req.log.error({ err }, "players/username failed");
    res.status(500).json({ error: msg || "Database error" });
  }
});

// GET /api/players/:deviceId — player profile + aggregated stats
router.get("/players/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  try {
    const player = await db.select(SAFE_PLAYER_COLS).from(players).where(eq(players.deviceId, deviceId)).limit(1);
    if (player.length === 0) {
      res.status(404).json({ error: "Player not found" });
      return;
    }
    const agg = await db
      .select({
        totalDebates: sql<number>`count(*)::int`,
        totalWins: sql<number>`sum(case when ${debates.won} then 1 else 0 end)::int`,
        bestScore: sql<number>`coalesce(max(${debates.avgScore}), 0)::int`,
        avgScore: sql<number>`coalesce(round(avg(${debates.avgScore}))::int, 0)`,
      })
      .from(debates)
      .where(eq(debates.playerId, player[0].id));

    const opponentHistory = await db
      .select({
        opponentId: debates.opponentId,
        wins: sql<number>`sum(case when ${debates.won} then 1 else 0 end)::int`,
        losses: sql<number>`sum(case when not ${debates.won} then 1 else 0 end)::int`,
      })
      .from(debates)
      .where(eq(debates.playerId, player[0].id))
      .groupBy(debates.opponentId);

    const oppMap: Record<string, { wins: number; losses: number }> = {};
    for (const row of opponentHistory) {
      oppMap[row.opponentId] = { wins: row.wins ?? 0, losses: row.losses ?? 0 };
    }

    res.json({
      ...player[0],
      stats: {
        debates: agg[0]?.totalDebates ?? 0,
        wins: agg[0]?.totalWins ?? 0,
        bestScore: agg[0]?.bestScore ?? 0,
        avgScore: agg[0]?.avgScore ?? 0,
        currentStreak: player[0].currentStreak ?? 0,
        bestStreak: player[0].bestStreak ?? 0,
        opponentHistory: oppMap,
      },
    });
  } catch (err: any) {
    req.log.error({ err }, "players/:deviceId failed");
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// POST /api/debates/save — persist a completed debate (supports JWT auth or deviceId)
router.post("/debates/save", async (req, res) => {
  const { deviceId, opponentId, opponentName, topic, topicCat, side, rounds, avgScore, avgLogic, avgPersuasion, avgDelivery, rank, won, isGauntlet } =
    req.body as Record<string, unknown>;
  try {
    const jwtPlayerId = getJwtPlayerId(req.headers.authorization);
    let player;
    if (jwtPlayerId) {
      const rows = await db.select(SAFE_PLAYER_COLS).from(players).where(eq(players.id, jwtPlayerId)).limit(1);
      player = rows;
      if (player.length === 0) {
        res.status(404).json({ error: "Authenticated player not found" });
        return;
      }
    } else {
      if (!deviceId || typeof deviceId !== "string") {
        res.status(400).json({ error: "deviceId required when not authenticated" });
        return;
      }
      const existing = await db.select(SAFE_PLAYER_COLS).from(players).where(eq(players.deviceId, deviceId as string)).limit(1);
      if (existing.length > 0) {
        player = existing;
      } else {
        const created = await db.insert(players).values({ deviceId: deviceId as string }).returning(SAFE_PLAYER_COLS);
        player = created;
        req.log.info({ deviceId }, "auto-created guest player on debate save");
      }
    }
    const inserted = await db.insert(debates).values({
      playerId: player[0].id,
      opponentId: (opponentId as string) ?? "unknown",
      opponentName: (opponentName as string) ?? "AI",
      topic: (topic as string) ?? "",
      topicCat: (topicCat as string) ?? "General",
      side: (side as string) ?? "for",
      rounds: Number(rounds) || 3,
      avgScore: Number(avgScore) || 0,
      avgLogic: Number(avgLogic) || 0,
      avgPersuasion: Number(avgPersuasion) || 0,
      avgDelivery: Number(avgDelivery) || 0,
      rank: (rank as string) ?? "D",
      won: Boolean(won),
      isGauntlet: Boolean(isGauntlet),
    }).returning();

    const newStreak = Boolean(won) ? (player[0].currentStreak ?? 0) + 1 : 0;
    const newBestStreak = Math.max(player[0].bestStreak ?? 0, newStreak);
    await db
      .update(players)
      .set({ currentStreak: newStreak, bestStreak: newBestStreak, updatedAt: new Date() })
      .where(eq(players.id, player[0].id));

    res.json({ ...inserted[0], currentStreak: newStreak, bestStreak: newBestStreak });
  } catch (err: any) {
    req.log.error({ err }, "debates/save failed");
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// GET /api/stats/global — real platform-wide stats
router.get("/stats/global", async (_req, res) => {
  try {
    const [debateStats, playerCount] = await Promise.all([
      db.select({
        total: sql<number>`count(*)::int`,
        wins: sql<number>`sum(case when ${debates.won} then 1 else 0 end)::int`,
        uniqueTopics: sql<number>`count(distinct ${debates.topic})::int`,
      }).from(debates),
      db.select({ count: sql<number>`count(*)::int` }).from(players),
    ]);
    const total = debateStats[0]?.total ?? 0;
    const wins = debateStats[0]?.wins ?? 0;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    res.json({
      totalDebates: total,
      globalWinRate: winRate,
      uniqueTopics: debateStats[0]?.uniqueTopics ?? 0,
      activePlayers: playerCount[0]?.count ?? 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// GET /api/leaderboard — top players ranked by score (wins * 200 + bestScore * 10)
router.get("/leaderboard", async (req, res) => {
  try {
    const weekly = req.query.period === "weekly";
    const since = weekly ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null;

    const joinCondition = since
      ? and(eq(debates.playerId, players.id), gte(debates.createdAt, since))
      : eq(debates.playerId, players.id);

    const rows = await db
      .select({
        id: players.id,
        username: players.username,
        deviceId: players.deviceId,
        currentStreak: players.currentStreak,
        bestStreak: players.bestStreak,
        wins: sql<number>`sum(case when ${debates.won} then 1 else 0 end)::int`,
        totalDebates: sql<number>`count(${debates.id})::int`,
        bestScore: sql<number>`coalesce(max(${debates.avgScore}), 0)::int`,
        score: sql<number>`(sum(case when ${debates.won} then 1 else 0 end) * 200 + coalesce(max(${debates.avgScore}), 0) * 10)::int`,
      })
      .from(players)
      .leftJoin(debates, joinCondition)
      .groupBy(players.id)
      .having(sql`count(${debates.id}) > 0`)
      .orderBy(desc(sql`(sum(case when ${debates.won} then 1 else 0 end) * 200 + coalesce(max(${debates.avgScore}), 0) * 10)`))
      .limit(100);

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

// GET /api/activity/recent — last 15 debates for the live feed
router.get("/activity/recent", async (_req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await db
      .select({
        username: players.username,
        deviceId: players.deviceId,
        opponentName: debates.opponentName,
        topic: debates.topic,
        topicCat: debates.topicCat,
        avgScore: debates.avgScore,
        won: debates.won,
        isGauntlet: debates.isGauntlet,
        rank: debates.rank,
        createdAt: debates.createdAt,
      })
      .from(debates)
      .leftJoin(players, eq(debates.playerId, players.id))
      .where(gte(debates.createdAt, weekAgo))
      .orderBy(desc(debates.createdAt))
      .limit(15);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

router.get("/players/public/:username", async (req, res) => {
  const { username } = req.params;
  if (!username || typeof username !== "string") { res.status(400).json({ error: "username required" }); return; }
  try {
    const found = await db.select(SAFE_PLAYER_COLS).from(players).where(eq(players.username, username)).limit(1);
    if (found.length === 0) { res.status(404).json({ error: "Player not found" }); return; }
    const p = found[0];
    const dbats = await db.select({ won: debates.won, avgScore: debates.avgScore }).from(debates).where(eq(debates.playerId, p.id)).limit(200);
    const wins = dbats.filter(d => d.won).length;
    const bestScore = dbats.reduce((m, d) => Math.max(m, d.avgScore ?? 0), 0);
    res.json({ username: p.username, debates: dbats.length, wins, bestScore, winRate: dbats.length > 0 ? Math.round((wins / dbats.length) * 100) : 0 });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

export default router;
