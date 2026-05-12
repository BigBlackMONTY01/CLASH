import { Router } from "express";
import { db, players, debates } from "@workspace/db";
import { eq, desc, sql, and, gte } from "drizzle-orm";

const router = Router();

// POST /api/players/register — create or fetch player by device ID
router.post("/players/register", async (req, res) => {
  const { deviceId } = req.body as Record<string, unknown>;
  if (!deviceId || typeof deviceId !== "string") {
    res.status(400).json({ error: "deviceId required" });
    return;
  }
  try {
    const existing = await db.select().from(players).where(eq(players.deviceId, deviceId)).limit(1);
    if (existing.length > 0) {
      res.json(existing[0]);
      return;
    }
    const inserted = await db.insert(players).values({ deviceId }).returning();
    res.json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "players/register failed");
    res.status(500).json({ error: "DB error" });
  }
});

// PATCH /api/players/username — set or update username
router.patch("/players/username", async (req, res) => {
  const { deviceId, username } = req.body as Record<string, unknown>;
  if (!deviceId || typeof deviceId !== "string" || !username || typeof username !== "string") {
    res.status(400).json({ error: "deviceId and username required" });
    return;
  }
  const trimmed = (username as string).trim().toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 20);
  if (trimmed.length < 2) {
    res.status(400).json({ error: "Username must be at least 2 characters (letters/numbers/underscores)" });
    return;
  }
  try {
    const updated = await db
      .update(players)
      .set({ username: trimmed, updatedAt: new Date() })
      .where(eq(players.deviceId, deviceId))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Player not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "That username is already taken" });
      return;
    }
    req.log.error({ err }, "players/username failed");
    res.status(500).json({ error: "DB error" });
  }
});

// GET /api/players/:deviceId — player profile + aggregated stats
router.get("/players/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  try {
    const player = await db.select().from(players).where(eq(players.deviceId, deviceId)).limit(1);
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
  } catch (err) {
    req.log.error({ err }, "players/:deviceId failed");
    res.status(500).json({ error: "DB error" });
  }
});

// POST /api/debates/save — persist a completed debate
router.post("/debates/save", async (req, res) => {
  const { deviceId, opponentId, opponentName, topic, topicCat, side, rounds, avgScore, avgLogic, avgPersuasion, avgDelivery, rank, won, isGauntlet } =
    req.body as Record<string, unknown>;
  if (!deviceId || typeof deviceId !== "string") {
    res.status(400).json({ error: "deviceId required" });
    return;
  }
  try {
    const player = await db.select().from(players).where(eq(players.deviceId, deviceId as string)).limit(1);
    if (player.length === 0) {
      res.status(404).json({ error: "Player not found" });
      return;
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
  } catch (err) {
    req.log.error({ err }, "debates/save failed");
    res.status(500).json({ error: "DB error" });
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
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// GET /api/leaderboard — top players ranked by score (wins * 200 + bestScore * 10)
// Query param: ?period=weekly  →  only debates from the last 7 days
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
      .limit(20);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// GET /api/activity/recent — last 10 debates for the live feed
router.get("/activity/recent", async (_req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await db
      .select({
        username: players.username,
        deviceId: players.deviceId,
        opponentName: debates.opponentName,
        topic: debates.topic,
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
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
