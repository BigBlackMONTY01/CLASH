import { Router } from "express";
import jwt from "jsonwebtoken";
import Groq from "groq-sdk";
import { JWT_SECRET } from "./auth";
import { db, players, debates } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const MODEL = "llama-3.3-70b-versatile";

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function scoreToRank(s: number): string {
  return s >= 90 ? "S" : s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "F";
}

function scoreToIQ(rank: string): number {
  const map: Record<string, number> = { S: 147, A: 133, B: 122, C: 111, D: 101, F: 88 };
  return map[rank] ?? 100;
}

interface InMemoryArg {
  id: number;
  roundNum: number;
  playerNum: 1 | 2;
  argumentText: string;
  score: number;
  logic: number;
  persuasion: number;
  delivery: number;
  rank: string;
  critique: string;
  highlights: { text: string; type: string; note: string }[];
}

interface InMemoryTaunt {
  id: number;
  text: string;
  fromName: string;
  fromPlayerNum: 1 | 2;
}

interface InMemoryRoom {
  code: string;
  topicText: string;
  topicCat: string;
  creator: string;
  joiner: string | null;
  creatorName: string;
  joinerName: string | null;
  player1Side: string | null;
  player2Side: string | null;
  player1Ready: boolean;
  player2Ready: boolean;
  status: "waiting" | "choosing" | "debating" | "complete";
  totalRounds: number;
  currentRound: number;
  winnerPlayerNum: number | null;
  player1Score: number | null;
  player2Score: number | null;
  player1Rank: string | null;
  player2Rank: string | null;
  arguments: InMemoryArg[];
  argCounter: number;
  latestTaunt: InMemoryTaunt | null;
  tauntCounter: number;
  createdAt: Date;
}

const store = new Map<string, InMemoryRoom>();

async function saveDebateRecord(callerId: string, room: InMemoryRoom, playerNum: 1 | 2): Promise<void> {
  try {
    let player;
    if (callerId.startsWith("jwt:")) {
      const id = parseInt(callerId.slice(4));
      const rows = await db.select().from(players).where(eq(players.id, id)).limit(1);
      player = rows[0];
    } else {
      const rows = await db.select().from(players).where(eq(players.deviceId, callerId)).limit(1);
      player = rows[0];
    }
    if (!player) return;

    const myArgs = room.arguments.filter(a => a.playerNum === playerNum);
    const myScore = playerNum === 1 ? room.player1Score : room.player2Score;
    const myRank = playerNum === 1 ? room.player1Rank : room.player2Rank;
    const oppName = playerNum === 1 ? (room.joinerName ?? "Opponent") : room.creatorName;
    const oppCallerId = playerNum === 1 ? (room.joiner ?? "human") : room.creator;
    const won = room.winnerPlayerNum === playerNum;
    const avgLogic = myArgs.length ? Math.round(myArgs.reduce((s, a) => s + a.logic, 0) / myArgs.length) : 0;
    const avgPersuasion = myArgs.length ? Math.round(myArgs.reduce((s, a) => s + a.persuasion, 0) / myArgs.length) : 0;
    const avgDelivery = myArgs.length ? Math.round(myArgs.reduce((s, a) => s + a.delivery, 0) / myArgs.length) : 0;

    await db.insert(debates).values({
      playerId: player.id,
      opponentId: oppCallerId,
      opponentName: oppName,
      topic: room.topicText,
      topicCat: room.topicCat || "1v1",
      side: (playerNum === 1 ? room.player1Side : room.player2Side) ?? "for",
      rounds: room.totalRounds,
      avgScore: myScore ?? 0,
      avgLogic,
      avgPersuasion,
      avgDelivery,
      rank: myRank ?? "D",
      won,
      isGauntlet: false,
    });

    const newStreak = won ? (player.currentStreak ?? 0) + 1 : 0;
    const newBestStreak = Math.max(player.bestStreak ?? 0, newStreak);
    await db.update(players)
      .set({ currentStreak: newStreak, bestStreak: newBestStreak, updatedAt: new Date() })
      .where(eq(players.id, player.id));
  } catch {
    // fire-and-forget — never break the response
  }
}

setInterval(() => {
  const cutoff = Date.now() - 3 * 60 * 60 * 1000;
  for (const [code, room] of store.entries()) {
    if (room.createdAt.getTime() < cutoff) store.delete(code);
  }
}, 30 * 60 * 1000);

function getCallerId(req: any): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      const p = jwt.verify(auth.slice(7), JWT_SECRET) as { playerId: number };
      return `jwt:${p.playerId}`;
    } catch {}
  }
  const deviceId = req.headers["x-device-id"] as string;
  return deviceId || null;
}

function getCallerName(req: any): string {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      const p = jwt.verify(auth.slice(7), JWT_SECRET) as { email?: string };
      if (p.email) return p.email.split("@")[0];
    } catch {}
  }
  const deviceId = req.headers["x-device-id"] as string;
  if (deviceId) return "GUEST#" + deviceId.slice(-4).toUpperCase();
  return "PLAYER";
}

function roomToState(room: InMemoryRoom, callerId: string | null) {
  const playerNum = callerId === room.creator ? 1 : callerId === room.joiner ? 2 : null;
  const iq1 = room.player1Rank ? scoreToIQ(room.player1Rank) : null;
  const iq2 = room.player2Rank ? scoreToIQ(room.player2Rank) : null;
  return {
    id: 0,
    code: room.code,
    topicText: room.topicText,
    topicCat: room.topicCat,
    player1Id: 1,
    player2Id: room.joiner ? 2 : null,
    player1Side: room.player1Side,
    player2Side: room.player2Side,
    player1Ready: room.player1Ready,
    player2Ready: room.player2Ready,
    status: room.status,
    totalRounds: room.totalRounds,
    currentRound: room.currentRound,
    winnerPlayerNum: room.winnerPlayerNum,
    player1Score: room.player1Score,
    player2Score: room.player2Score,
    player1Rank: room.player1Rank,
    player2Rank: room.player2Rank,
    player1Name: room.creatorName,
    player2Name: room.joinerName,
    arguments: room.arguments.map(a => ({
      id: a.id,
      roomId: 0,
      roundNum: a.roundNum,
      playerNum: a.playerNum,
      argumentText: a.argumentText,
      score: a.score,
      logic: a.logic,
      persuasion: a.persuasion,
      delivery: a.delivery,
      rank: a.rank,
      critique: a.critique,
      highlights: JSON.stringify(a.highlights),
    })),
    playerNum,
    iq1,
    iq2,
    latestTaunt: room.latestTaunt,
  };
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

router.post("/1v1/create", (req, res) => {
  const callerId = getCallerId(req);
  if (!callerId) { res.status(401).json({ error: "Device ID or auth required" }); return; }
  const callerName = getCallerName(req);
  const { totalRounds } = req.body as { totalRounds?: number };
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  let code = "";
  for (let i = 0; i < 20; i++) {
    const c = generateCode();
    if (!store.has(c)) { code = c; break; }
  }
  if (!code) { res.status(500).json({ error: "Could not generate room code" }); return; }

  const room: InMemoryRoom = {
    code,
    topicText: topic.text,
    topicCat: topic.cat,
    creator: callerId,
    joiner: null,
    creatorName: callerName,
    joinerName: null,
    player1Side: null,
    player2Side: null,
    player1Ready: false,
    player2Ready: false,
    status: "waiting",
    totalRounds: totalRounds || 3,
    currentRound: 1,
    winnerPlayerNum: null,
    player1Score: null,
    player2Score: null,
    player1Rank: null,
    player2Rank: null,
    arguments: [],
    argCounter: 0,
    latestTaunt: null,
    tauntCounter: 0,
    createdAt: new Date(),
  };
  store.set(code, room);
  res.json({ code });
});

router.post("/1v1/join", (req, res) => {
  const callerId = getCallerId(req);
  if (!callerId) { res.status(401).json({ error: "Device ID or auth required" }); return; }
  const callerName = getCallerName(req);
  const { code } = req.body as { code: string };
  if (!code) { res.status(400).json({ error: "Room code required" }); return; }

  const room = store.get(code.toUpperCase().trim());
  if (!room) { res.status(404).json({ error: "Room not found. Double-check your code." }); return; }
  if (room.status === "complete") { res.status(400).json({ error: "This debate has already ended." }); return; }
  if (room.creator === callerId) { res.json({ code: room.code, playerNum: 1 }); return; }
  if (room.joiner && room.joiner !== callerId) { res.status(400).json({ error: "Room is full." }); return; }

  if (!room.joiner) {
    room.joiner = callerId;
    room.joinerName = callerName;
    room.status = "choosing";
  }
  res.json({ code: room.code, playerNum: 2 });
});

router.get("/1v1/room/:code", (req, res) => {
  const callerId = getCallerId(req);
  const { code } = req.params;
  const room = store.get(code.toUpperCase());
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  res.json(roomToState(room, callerId));
});

router.post("/1v1/:code/sides", (req, res) => {
  const callerId = getCallerId(req);
  if (!callerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const { side } = req.body as { side: "for" | "against" };
  const room = store.get(code.toUpperCase());
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  if (room.creator !== callerId) { res.status(403).json({ error: "Only the room creator picks sides" }); return; }
  room.player1Side = side;
  room.player2Side = side === "for" ? "against" : "for";
  res.json({ ok: true });
});

router.post("/1v1/:code/ready", (req, res) => {
  const callerId = getCallerId(req);
  if (!callerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const room = store.get(code.toUpperCase());
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  if (room.creator === callerId) room.player1Ready = true;
  else if (room.joiner === callerId) room.player2Ready = true;
  if (room.player1Ready && room.player2Ready) room.status = "debating";
  res.json({ ok: true });
});

router.post("/1v1/:code/argue", async (req, res) => {
  const callerId = getCallerId(req);
  if (!callerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const { argumentText } = req.body as { argumentText: string };
  if (!argumentText?.trim()) { res.status(400).json({ error: "Argument required" }); return; }

  const room = store.get(code.toUpperCase());
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  if (room.status !== "debating") { res.status(400).json({ error: "Debate not active yet" }); return; }

  const playerNum: 1 | 2 | null = room.creator === callerId ? 1 : room.joiner === callerId ? 2 : null;
  if (!playerNum) { res.status(403).json({ error: "You are not in this room" }); return; }

  const already = room.arguments.find(a => a.roundNum === room.currentRound && a.playerNum === playerNum);
  if (already) { res.status(400).json({ error: "You already submitted this round" }); return; }

  const side = playerNum === 1 ? room.player1Side : room.player2Side;

  const system = `You are a strict AI debate judge. Respond ONLY with valid JSON, no other text.
Topic: "${room.topicText}"
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

Ranks: S>=90 A>=80 B>=65 C>=50 D>=35 F<35
Highlight types: strong=green(well-supported), weak=yellow(vague), wrong=red(factually incorrect), fallacy=orange(logical fallacy)
Find 3-5 exact substrings from the argument text.`;

  let judgment: any;
  try {
    const raw = await getGroq().chat.completions.create({
      model: MODEL,
      max_tokens: 600,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Judge this debate argument:\n\n"${argumentText}"` },
      ],
    }).then(r => r.choices[0]?.message?.content);
    const match = raw?.match(/\{[\s\S]*\}/);
    judgment = match ? JSON.parse(match[0]) : null;
  } catch { judgment = null; }

  if (!judgment) {
    const s = 55 + Math.floor(Math.random() * 20);
    judgment = { score: s, logic: s, persuasion: s, delivery: s, rank: scoreToRank(s), critique: "Argument noted.", highlights: [] };
  }

  const arg: InMemoryArg = {
    id: ++room.argCounter,
    roundNum: room.currentRound,
    playerNum,
    argumentText,
    score: judgment.score,
    logic: judgment.logic,
    persuasion: judgment.persuasion,
    delivery: judgment.delivery,
    rank: judgment.rank,
    critique: judgment.critique,
    highlights: judgment.highlights || [],
  };
  room.arguments.push(arg);

  const roundArgs = room.arguments.filter(a => a.roundNum === room.currentRound);
  if (roundArgs.length >= 2) {
    if (room.currentRound >= room.totalRounds) {
      const p1Args = room.arguments.filter(a => a.playerNum === 1);
      const p2Args = room.arguments.filter(a => a.playerNum === 2);
      const p1Avg = p1Args.length ? Math.round(p1Args.reduce((s, a) => s + a.score, 0) / p1Args.length) : 0;
      const p2Avg = p2Args.length ? Math.round(p2Args.reduce((s, a) => s + a.score, 0) / p2Args.length) : 0;
      room.status = "complete";
      room.winnerPlayerNum = p1Avg >= p2Avg ? 1 : 2;
      room.player1Score = p1Avg;
      room.player2Score = p2Avg;
      room.player1Rank = scoreToRank(p1Avg);
      room.player2Rank = scoreToRank(p2Avg);
      saveDebateRecord(room.creator, room, 1);
      if (room.joiner) saveDebateRecord(room.joiner, room, 2);
    } else {
      room.currentRound++;
    }
  }

  res.json({ ...arg, highlights: arg.highlights, roomId: 0 });
});

router.post("/1v1/:code/taunt", (req, res) => {
  const callerId = getCallerId(req);
  if (!callerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const room = store.get(code.toUpperCase());
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  const { text } = req.body as { text: string };
  if (!text?.trim()) { res.status(400).json({ error: "Text required" }); return; }
  const fromPlayerNum: 1 | 2 = room.creator === callerId ? 1 : 2;
  const fromName = fromPlayerNum === 1 ? room.creatorName : (room.joinerName ?? "Opponent");
  room.tauntCounter += 1;
  room.latestTaunt = { id: room.tauntCounter, text: text.trim(), fromName, fromPlayerNum };
  res.json({ ok: true });
});

router.post("/1v1/:code/forfeit", (req, res) => {
  const callerId = getCallerId(req);
  if (!callerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const room = store.get(code.toUpperCase());
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  const playerNum = room.creator === callerId ? 1 : 2;
  room.status = "complete";
  room.winnerPlayerNum = playerNum === 1 ? 2 : 1;
  room.player1Score = playerNum === 1 ? 0 : (room.player1Score || 60);
  room.player2Score = playerNum === 2 ? 0 : (room.player2Score || 60);
  room.player1Rank = playerNum === 1 ? "F" : (room.player1Rank || "C");
  room.player2Rank = playerNum === 2 ? "F" : (room.player2Rank || "C");
  saveDebateRecord(room.creator, room, 1);
  if (room.joiner) saveDebateRecord(room.joiner, room, 2);
  res.json({ ok: true });
});

router.post("/1v1/:code/set-topic", (req, res) => {
  const callerId = getCallerId(req);
  if (!callerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const { topicText, topicCat } = req.body as { topicText: string; topicCat?: string };
  if (!topicText?.trim()) { res.status(400).json({ error: "Topic text required" }); return; }
  const room = store.get(code.toUpperCase());
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  if (room.creator !== callerId) { res.status(403).json({ error: "Only the host can change the topic" }); return; }
  if (room.status !== "waiting") { res.status(400).json({ error: "Cannot change topic after opponent joins" }); return; }
  room.topicText = topicText.trim();
  room.topicCat = topicCat || "Custom";
  res.json({ ok: true });
});

router.post("/1v1/:code/set-rounds", (req, res) => {
  const callerId = getCallerId(req);
  if (!callerId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { code } = req.params;
  const { totalRounds } = req.body as { totalRounds: number };
  const room = store.get(code.toUpperCase());
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  if (room.creator !== callerId) { res.status(403).json({ error: "Only the host can change rounds" }); return; }
  if (room.status !== "waiting") { res.status(400).json({ error: "Cannot change rounds after opponent joins" }); return; }
  const rounds = Math.min(5, Math.max(1, Number(totalRounds) || 3));
  room.totalRounds = rounds;
  res.json({ ok: true });
});

export default router;
