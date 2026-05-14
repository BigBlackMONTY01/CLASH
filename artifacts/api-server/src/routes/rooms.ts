import { Router } from "express";
import jwt from "jsonwebtoken";
import Groq from "groq-sdk";
import { db, players, rooms, roomArguments } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { JWT_SECRET } from "./auth";

const router = Router();
const MODEL = "llama-3.3-70b-versatile";

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

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
  const msg = await withRetry(() => getGroq().chat.completions.create({
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
  { text: "Free will is an illusion", cat: "Philosophy" },
  { text: "Money can buy happiness", cat: "Philosophy" },
  { text: "Humans are inherently selfish", cat: "Philosophy" },
  { text: "Luck matters more than talent", cat: "Philosophy" },
  { text: "Morality is objective not subjective", cat: "Philosophy" },
  { text: "Technology is making humans less human", cat: "Philosophy" },
  { text: "Art matters more than science to human flourishing", cat: "Philosophy" },
  { text: "Democracy is the least bad political system", cat: "Philosophy" },
  { text: "Lying is sometimes morally justified", cat: "Ethics" },
  { text: "Zoos are ethical", cat: "Ethics" },
  { text: "It is ethical to eat meat", cat: "Ethics" },
  { text: "Billionaires should not exist", cat: "Ethics" },
  { text: "Medical experiments on animals are justified", cat: "Ethics" },
  { text: "Designer babies are ethically acceptable", cat: "Ethics" },
  { text: "Euthanasia should be legal everywhere", cat: "Ethics" },
  { text: "Affirmative action is morally justified", cat: "Ethics" },
  { text: "It is unethical to have children in a climate crisis", cat: "Ethics" },
  { text: "Mandatory organ donation after death is ethical", cat: "Ethics" },
  { text: "Assisted dying is a fundamental human right", cat: "Ethics" },
  { text: "Eating meat is morally equivalent to harming animals", cat: "Ethics" },
  { text: "Marvel movies have ruined cinema", cat: "Pop Culture" },
  { text: "Reality TV is harmful to society", cat: "Pop Culture" },
  { text: "Social media influencers deserve their income", cat: "Pop Culture" },
  { text: "Esports deserve Olympic recognition", cat: "Pop Culture" },
  { text: "Nostalgia is killing creativity in entertainment", cat: "Pop Culture" },
  { text: "Hip-hop is the most important music genre of the last 50 years", cat: "Pop Culture" },
  { text: "TikTok has damaged attention spans irreversibly", cat: "Pop Culture" },
  { text: "TV shows are now better than movies", cat: "Pop Culture" },
  { text: "Violent video games cause real-world violence", cat: "Pop Culture" },
  { text: "True crime content glorifies criminals", cat: "Pop Culture" },
  { text: "Superhero fatigue is real and deserved", cat: "Pop Culture" },
  { text: "The four-day work week should be standard", cat: "Society" },
  { text: "Marriage as an institution is outdated", cat: "Society" },
  { text: "Mandatory voting should be law", cat: "Society" },
  { text: "Prisons should focus on rehabilitation not punishment", cat: "Society" },
  { text: "Open borders would benefit the global economy", cat: "Society" },
  { text: "Wealth inequality is the defining crisis of our generation", cat: "Society" },
  { text: "Universal healthcare is a human right", cat: "Society" },
  { text: "Gender roles are harmful to everyone", cat: "Society" },
  { text: "Tipping culture should be abolished", cat: "Society" },
  { text: "Meritocracy is a myth", cat: "Society" },
  { text: "Free speech absolutism causes real harm", cat: "Society" },
  { text: "Organized religion does more harm than good", cat: "Society" },
  { text: "Drug addiction should be treated not criminalized", cat: "Society" },
  { text: "AI will replace most white-collar jobs within 20 years", cat: "Technology" },
  { text: "Deepfakes are an existential threat to democracy", cat: "Technology" },
  { text: "Silicon Valley culture is toxic and needs to change", cat: "Technology" },
  { text: "AI-generated art is not real art", cat: "Technology" },
  { text: "Big tech giants should be broken up by governments", cat: "Technology" },
  { text: "Internet access is a basic human right", cat: "Technology" },
  { text: "Facial recognition in public spaces should be banned", cat: "Technology" },
  { text: "Algorithms are making us more polarized", cat: "Technology" },
  { text: "AI should not be used in criminal sentencing", cat: "Technology" },
  { text: "Cryptocurrency is the future of money", cat: "Technology" },
  { text: "We should colonize Mars before fixing Earth", cat: "Technology" },
  { text: "Neuralink-style brain chips are inevitable and good", cat: "Technology" },
  { text: "Nuclear energy is safer than fossil fuels", cat: "Technology" },
  { text: "Individual action cannot stop climate change", cat: "Environment" },
  { text: "Veganism is the single best thing you can do for the planet", cat: "Environment" },
  { text: "Carbon taxes are the most effective climate policy", cat: "Environment" },
  { text: "Factory farming should be banned globally", cat: "Environment" },
  { text: "Climate activists who break the law are justified", cat: "Environment" },
  { text: "Eco-friendly products are mostly greenwashing", cat: "Environment" },
  { text: "Environmental protection should override economic growth", cat: "Environment" },
  { text: "The minimum wage should be a living wage everywhere", cat: "Economics" },
  { text: "Inheritance should be heavily taxed", cat: "Economics" },
  { text: "Privatization of public services always fails", cat: "Economics" },
  { text: "A wealth tax is fair and feasible", cat: "Economics" },
  { text: "Trickle-down economics has been proven to fail", cat: "Economics" },
  { text: "The housing market is broken beyond repair", cat: "Economics" },
  { text: "CEOs are paid astronomically more than they are worth", cat: "Economics" },
  { text: "University degrees are no longer worth the cost", cat: "Education" },
  { text: "Schools should teach financial literacy", cat: "Education" },
  { text: "Private schools should be banned", cat: "Education" },
  { text: "Online learning is as effective as classroom learning", cat: "Education" },
  { text: "Critical thinking is more important than subject knowledge", cat: "Education" },
  { text: "Arts education is as important as STEM", cat: "Education" },
  { text: "Teachers are the most undervalued profession in society", cat: "Education" },
  { text: "Grades are a poor measure of intelligence", cat: "Education" },
  { text: "Mental health should be treated the same as physical health", cat: "Health" },
  { text: "The pharmaceutical industry does more harm than good", cat: "Health" },
  { text: "Vaccines should be mandatory", cat: "Health" },
  { text: "Alternative medicine is mostly placebo", cat: "Health" },
  { text: "Social media causes the mental health crisis in teenagers", cat: "Health" },
  { text: "Loneliness is the defining public health crisis of our era", cat: "Health" },
  { text: "Burnout is caused by employers not employees", cat: "Health" },
  { text: "Addiction is a disease not a moral failing", cat: "Health" },
  { text: "The right to bear arms causes more harm than good", cat: "Law" },
  { text: "Hate speech laws infringe on free expression", cat: "Law" },
  { text: "Non-violent offenders should never be imprisoned", cat: "Law" },
  { text: "Solitary confinement is torture and should be banned", cat: "Law" },
  { text: "Social media companies should be liable for user-generated harm", cat: "Law" },
  { text: "Colonialism's effects are still the root cause of global inequality", cat: "History" },
  { text: "The atomic bombings of Hiroshima and Nagasaki were unjustified", cat: "History" },
  { text: "The Cold War never truly ended", cat: "History" },
  { text: "History is written by the winners and always will be", cat: "History" },
  { text: "The United Nations has been a failure", cat: "History" },
  { text: "Money has ruined professional football", cat: "Sports" },
  { text: "Doping should be allowed in professional sports", cat: "Sports" },
  { text: "Women's sports deserve equal pay and coverage", cat: "Sports" },
  { text: "College athletes should be paid", cat: "Sports" },
  { text: "Golf is not a real sport", cat: "Sports" },
  { text: "Hosting the Olympics is a financial disaster for cities", cat: "Sports" },
  { text: "LeBron James is better than Michael Jordan", cat: "Sports" },
  { text: "Sports betting is destroying the integrity of sport", cat: "Sports" },
  { text: "Long-distance relationships are doomed to fail", cat: "Relationships" },
  { text: "Men and women cannot be purely platonic friends", cat: "Relationships" },
  { text: "You should never stay with someone who cheated", cat: "Relationships" },
  { text: "Having children is a selfish decision in 2025", cat: "Relationships" },
  { text: "True love is a choice not a feeling", cat: "Relationships" },
  { text: "Ghosting someone is a form of emotional cruelty", cat: "Relationships" },
  { text: "Lab-grown meat will replace traditional meat within 20 years", cat: "Food" },
  { text: "Organic food is a marketing scam", cat: "Food" },
  { text: "Alcohol is more harmful than most illegal drugs", cat: "Food" },
  { text: "China will overtake the US as the world's dominant superpower", cat: "International" },
  { text: "NATO has outlived its usefulness", cat: "International" },
  { text: "Nuclear weapons make the world safer through deterrence", cat: "International" },
  { text: "Open borders would solve more problems than they create", cat: "International" },
  { text: "International aid creates dependency not development", cat: "International" },
  { text: "Pineapple belongs on pizza", cat: "Hot Take" },
  { text: "Coffee is overrated", cat: "Hot Take" },
  { text: "Introverts make better leaders", cat: "Hot Take" },
  { text: "Gym culture has become toxic", cat: "Hot Take" },
  { text: "City life is superior to country life", cat: "Hot Take" },
  { text: "Waking up early is overrated productivity advice", cat: "Hot Take" },
  { text: "The best art comes from suffering", cat: "Hot Take" },
  { text: "Astrology is as valid as psychology", cat: "Hot Take" },
  { text: "Side hustles are a red flag not a green flag", cat: "Hot Take" },
  { text: "Texting is better than calling", cat: "Hot Take" },
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
