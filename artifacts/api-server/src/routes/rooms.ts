import { Router } from "express";
import jwt from "jsonwebtoken";
import Groq from "groq-sdk";
import { db, players, rooms, roomArguments } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { JWT_SECRET } from "./auth";

const router = Router();
const MODEL = "llama-3.3-70b-versatile";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e: any) {
      last = e;
      if (e?.status === 429 && i < attempts - 1) await new Promise(r => setTimeout(r, (i + 1) * 3000));
      else throw e;
    }
  }
  throw last;
}

async function claudeJSON(system: string, user: string): Promise<string> {
  const msg = await withRetry(() => groq.chat.completions.create({
    model: MODEL, max_tokens: 600,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  }));
  const text = msg.choices[0]?.message?.content;
  if (!text) throw new Error("No text response");
  return text;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function scoreToRank(s: number) {
  return s >= 90 ? "S" : s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "F";
}

function scoreToIQ(rank: string) {
  const map: Record<string, number> = { S: 147, A: 133, B: 122, C: 111, D: 101, F: 88 };
  return map[rank] ?? 100;
}

async function getPlayerId(req: any): Promise<number | null> {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      const p = jwt.verify(auth.slice(7), JWT_SECRET) as { playerId: number };
      return p.playerId;
    } catch {}
  }
  const deviceId = req.headers["x-device-id"] as string;
  if (deviceId) {
    const p = await db.select().from(players).where(eq(players.deviceId, deviceId)).limit(1);
    if (p.length > 0) return p[0].id;
  }
  return null;
}

async function getPlayerName(id: number): Promise<string> {
  const p = await db.select({ username: players.username, deviceId: players.deviceId }).from(players).where(eq(players.id, id)).limit(1);
  if (!p.length) return "UNKNOWN";
  return p[0].username || ("GUEST#" + p[0].deviceId.slice(-4).toUpperCase());
}

const TOPICS = [
  { text: "AI will make humanity obsolete within 50 years", cat: "Technology" },
  { text: "Social media does more harm than good", cat: "Society" },
  { text: "Universal basic income would help society", cat: "Society" },
  { text: "Remote work is better than office work", cat: "Society" },
  { text: "Streaming killed the music industry", cat: "Pop Culture" },
  { text: "The death penalty should be abolished", cat: "Ethics" },
  { text: "Cancel culture has gone too far", cat: "Society" },
  { text: "Happiness is a choice", cat: "Philosophy" },
  { text: "Video games are a valid art form", cat: "Pop Culture" },
  { text: "Climate change is the defining crisis of our time", cat: "Science" },
  { text: "Privacy is more important than national security", cat: "Ethics" },
  { text: "Space exploration is worth the cost", cat: "Science" },
  { text: "Capitalism does more harm than good", cat: "Economics" },
  { text: "Standardized testing should be abolished", cat: "Education" },
  { text: "The ends justify the means", cat: "Philosophy" },
];

// POST /api/rooms/create
router.post("/rooms/create", async (req, res) => {
  const playerId = await getPlayerId(req);
  if (!playerId) { res.status(401).json({ error: "You must be registered to create a room" }); return; }
  const { totalRounds } = req.body as { totalRounds?: number };
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  let code = "";
  for (let i = 0; i < 10; i++) {
    const c = generateCode();
    const ex = await db.select().from(rooms).where(eq(rooms.code, c)).limit(1);
    if (!ex.length) { code = c; break; }
  }
  if (!code) { res.status(500).json({ error: "Could not generate room code" }); return; }

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const room = await db.insert(rooms).values({
    code, topicText: topic.text, topicCat: topic.cat,
    player1Id: playerId, totalRounds: totalRounds || 3, expiresAt,
  }).returning();

  res.json({ code: room[0].code, roomId: room[0].id });
});

// POST /api/rooms/join
router.post("/rooms/join", async (req, res) => {
  const playerId = await getPlayerId(req);
  if (!playerId) { res.status(401).json({ error: "You must be registered to join a room" }); return; }
  const { code } = req.body as { code: string };
  if (!code) { res.status(400).json({ error: "Room code required" }); return; }

  const room = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase().trim())).limit(1);
  if (!room.length) { res.status(404).json({ error: "Room not found. Double-check your code." }); return; }
  const r = room[0];
  if (r.status === "complete") { res.status(400).json({ error: "This debate has already ended." }); return; }
  if (!["waiting", "choosing"].includes(r.status) && r.player2Id !== playerId) {
    res.status(400).json({ error: "This room is already in progress." }); return;
  }
  if (r.player1Id === playerId) { res.json({ code: r.code, playerNum: 1 }); return; }
  if (r.player2Id && r.player2Id !== playerId) { res.status(400).json({ error: "Room is full." }); return; }
  if (new Date(r.expiresAt) < new Date()) { res.status(400).json({ error: "This room has expired." }); return; }

  if (!r.player2Id) {
    await db.update(rooms).set({ player2Id: playerId, status: "choosing" }).where(eq(rooms.id, r.id));
  }
  res.json({ code: r.code, playerNum: 2 });
});

// GET /api/rooms/:code — poll state
router.get("/rooms/:code", async (req, res) => {
  const playerId = await getPlayerId(req);
  const { code } = req.params;
  const room = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase())).limit(1);
  if (!room.length) { res.status(404).json({ error: "Room not found" }); return; }
  const r = room[0];

  const [p1Name, p2Name] = await Promise.all([
    getPlayerName(r.player1Id),
    r.player2Id ? getPlayerName(r.player2Id) : Promise.resolve(null),
  ]);

  const args = await db.select().from(roomArguments).where(eq(roomArguments.roomId, r.id));
  const playerNum = playerId === r.player1Id ? 1 : playerId === r.player2Id ? 2 : null;

  const iq1 = r.player1Rank ? scoreToIQ(r.player1Rank) : null;
  const iq2 = r.player2Rank ? scoreToIQ(r.player2Rank) : null;

  res.json({ ...r, player1Name: p1Name, player2Name: p2Name, arguments: args, playerNum, iq1, iq2 });
});

// POST /api/rooms/:code/sides
router.post("/rooms/:code/sides", async (req, res) => {
  const playerId = await getPlayerId(req);
  if (!playerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const { side } = req.body as { side: "for" | "against" };
  const room = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase())).limit(1);
  if (!room.length) { res.status(404).json({ error: "Room not found" }); return; }
  const r = room[0];
  if (r.player1Id !== playerId) { res.status(403).json({ error: "Only the room creator picks sides" }); return; }
  const oppSide = side === "for" ? "against" : "for";
  await db.update(rooms).set({ player1Side: side, player2Side: oppSide }).where(eq(rooms.id, r.id));
  res.json({ ok: true });
});

// POST /api/rooms/:code/ready
router.post("/rooms/:code/ready", async (req, res) => {
  const playerId = await getPlayerId(req);
  if (!playerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const room = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase())).limit(1);
  if (!room.length) { res.status(404).json({ error: "Room not found" }); return; }
  const r = room[0];
  const updates: Record<string, unknown> = {};
  if (r.player1Id === playerId) updates.player1Ready = true;
  else if (r.player2Id === playerId) updates.player2Ready = true;
  const p1Ready = (updates.player1Ready as boolean) || r.player1Ready;
  const p2Ready = (updates.player2Ready as boolean) || r.player2Ready;
  if (p1Ready && p2Ready) updates.status = "debating";
  await db.update(rooms).set(updates).where(eq(rooms.id, r.id));
  res.json({ ok: true });
});

// POST /api/rooms/:code/argue — submit argument, AI judges it with highlights
router.post("/rooms/:code/argue", async (req, res) => {
  const playerId = await getPlayerId(req);
  if (!playerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const { argumentText } = req.body as { argumentText: string };
  if (!argumentText?.trim()) { res.status(400).json({ error: "Argument required" }); return; }

  const room = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase())).limit(1);
  if (!room.length) { res.status(404).json({ error: "Room not found" }); return; }
  const r = room[0];
  if (r.status !== "debating") { res.status(400).json({ error: "Debate not active yet" }); return; }

  const playerNum = r.player1Id === playerId ? 1 : r.player2Id === playerId ? 2 : null;
  if (!playerNum) { res.status(403).json({ error: "You are not in this room" }); return; }

  const existing = await db.select().from(roomArguments)
    .where(and(eq(roomArguments.roomId, r.id), eq(roomArguments.roundNum, r.currentRound), eq(roomArguments.playerNum, playerNum)))
    .limit(1);
  if (existing.length) { res.status(400).json({ error: "You already submitted this round" }); return; }

  const side = playerNum === 1 ? r.player1Side : r.player2Side;

  const system = `You are a strict AI debate judge. Respond ONLY with valid JSON, no other text.
Topic: "${r.topicText}"
The debater is arguing ${(side || "for").toUpperCase()} this statement.

Return this exact JSON structure:
{
  "score": <0-100>,
  "logic": <0-100>,
  "persuasion": <0-100>,
  "delivery": <0-100>,
  "rank": "<S|A|B|C|D|F>",
  "critique": "<2 sharp sentences>",
  "highlights": [
    { "text": "<exact substring from argument>", "type": "<strong|weak|wrong|fallacy>", "note": "<10 words max>" }
  ]
}

Ranks: S≥90 A≥80 B≥65 C≥50 D≥35 F<35
Highlight types: strong=green(well-supported), weak=yellow(vague/unsubstantiated), wrong=red(factually incorrect), fallacy=orange(logical fallacy)
Find 3-5 exact substrings from the argument text. Be precise and harsh.`;

  let judgment: any;
  try {
    const raw = await claudeJSON(system, `Judge this debate argument:\n\n"${argumentText}"`);
    const match = raw.match(/\{[\s\S]*\}/);
    judgment = match ? JSON.parse(match[0]) : null;
  } catch { judgment = null; }

  if (!judgment) {
    const s = 55 + Math.floor(Math.random() * 20);
    judgment = { score: s, logic: s, persuasion: s, delivery: s, rank: scoreToRank(s), critique: "Argument noted.", highlights: [] };
  }

  const saved = await db.insert(roomArguments).values({
    roomId: r.id, roundNum: r.currentRound, playerNum,
    argumentText, score: judgment.score, logic: judgment.logic,
    persuasion: judgment.persuasion, delivery: judgment.delivery,
    rank: judgment.rank, critique: judgment.critique,
    highlights: JSON.stringify(judgment.highlights || []),
  }).returning();

  // Check if both players submitted this round
  const roundArgs = await db.select().from(roomArguments)
    .where(and(eq(roomArguments.roomId, r.id), eq(roomArguments.roundNum, r.currentRound)));

  if (roundArgs.length >= 2) {
    if (r.currentRound >= r.totalRounds) {
      const allArgs = await db.select().from(roomArguments).where(eq(roomArguments.roomId, r.id));
      const p1Args = allArgs.filter(a => a.playerNum === 1);
      const p2Args = allArgs.filter(a => a.playerNum === 2);
      const p1Avg = p1Args.length ? Math.round(p1Args.reduce((s, a) => s + (a.score || 0), 0) / p1Args.length) : 0;
      const p2Avg = p2Args.length ? Math.round(p2Args.reduce((s, a) => s + (a.score || 0), 0) / p2Args.length) : 0;
      await db.update(rooms).set({
        status: "complete",
        winnerPlayerNum: p1Avg >= p2Avg ? 1 : 2,
        player1Score: p1Avg, player2Score: p2Avg,
        player1Rank: scoreToRank(p1Avg), player2Rank: scoreToRank(p2Avg),
      }).where(eq(rooms.id, r.id));
    } else {
      await db.update(rooms).set({ currentRound: r.currentRound + 1 }).where(eq(rooms.id, r.id));
    }
  }

  res.json({ ...saved[0], highlights: judgment.highlights || [], critique: judgment.critique });
});

// POST /api/rooms/:code/forfeit
router.post("/rooms/:code/forfeit", async (req, res) => {
  const playerId = await getPlayerId(req);
  if (!playerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const room = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase())).limit(1);
  if (!room.length) { res.status(404).json({ error: "Room not found" }); return; }
  const r = room[0];
  const playerNum = r.player1Id === playerId ? 1 : 2;
  await db.update(rooms).set({
    status: "complete", winnerPlayerNum: playerNum === 1 ? 2 : 1,
    player1Score: playerNum === 1 ? 0 : (r.player1Score || 60),
    player2Score: playerNum === 2 ? 0 : (r.player2Score || 60),
    player1Rank: playerNum === 1 ? "F" : (r.player1Rank || "C"),
    player2Rank: playerNum === 2 ? "F" : (r.player2Rank || "C"),
  }).where(eq(rooms.id, r.id));
  res.json({ ok: true });
});

export { scoreToIQ };
export default router;
