import { Router } from "express";
import Groq from "groq-sdk";

const router = Router();
const MODEL_PRIMARY  = "llama-3.3-70b-versatile";
const MODEL_FALLBACK = "llama-3.1-8b-instant";

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

function is429(e: unknown): boolean {
  return (e as any)?.status === 429 || String((e as any)?.message ?? "").includes("429");
}

const CALL_TIMEOUT_MS = 25000;
const MAX_CONCURRENT  = Number(process.env.GROQ_MAX_CONCURRENCY ?? 8);
const QUEUE_WAIT_MS   = 120000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("AI request timed out")), ms)
    ),
  ]);
}

class Semaphore {
  private running = 0;
  private queue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (this.running < MAX_CONCURRENT) {
      this.running++;
      return;
    }
    await withTimeout(
      new Promise<void>(resolve => this.queue.push(resolve)),
      QUEUE_WAIT_MS
    );
    this.running++;
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }
}

const semaphore = new Semaphore();

async function groqCall(
  model: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  maxTokens: number
): Promise<string> {
  const msg = await withTimeout(
    getGroq().chat.completions.create({ model, max_tokens: maxTokens, messages }),
    CALL_TIMEOUT_MS
  );
  const text = msg.choices[0]?.message?.content;
  if (!text) throw new Error("No text in response");
  return text;
}

async function groqWithFallback(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  maxTokens: number
): Promise<string> {
  await semaphore.acquire();
  try {
    try {
      return await groqCall(MODEL_PRIMARY, messages, maxTokens);
    } catch (e) {
      if (is429(e) || (e as Error).message === "AI request timed out") {
        return await groqCall(MODEL_FALLBACK, messages, maxTokens);
      }
      throw e;
    }
  } finally {
    semaphore.release();
  }
}

async function claudeText(system: string, userMsg: string, maxTokens = 600): Promise<string> {
  return groqWithFallback(
    [{ role: "system", content: system }, { role: "user", content: userMsg }],
    maxTokens
  );
}

async function claudeConversation(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  maxTokens = 600
): Promise<string> {
  return groqWithFallback(
    [{ role: "system", content: system }, ...messages],
    maxTokens
  );
}

function responseTokens(diff: string): number {
  switch (diff) {
    case "easy":    return 200;
    case "medium":  return 220;
    case "hard":    return 280;
    case "extreme": return 250;
    default:        return 200;
  }
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}
function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function bool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

const FORMATTING = `

LENGTH RULE — obey your difficulty sentence limit exactly. Stop when done.
- Every sentence must make a direct point. No filler.
- Do NOT start with "I" or repeat what the user just said back to them.

YOU ARE A HUMAN. ACT LIKE ONE. THIS IS NON-NEGOTIABLE:
- Zero AI tells. Never say "certainly", "absolutely", "great point", "indeed", "it's worth noting", "furthermore", "moreover", "I understand your perspective", or anything that sounds like an assistant.
- No perfectly balanced, diplomatic hedging. Humans take a side and stick to it.
- No academic essay structure. Talk the way a sharp, opinionated person texts or speaks.
- Occasional informality is fine — a fragment, a rhetorical jab, a one-liner. Real people talk like that.
- Never acknowledge being an AI, never break character, never explain your reasoning process.
- If someone asks if you're an AI, deny it with irritation like a human would.

FORMATTING:
- Plain conversational prose only. No markdown, bullets, headers, or asterisks.
- No em-dashes or en-dashes. Commas and periods only.

VARIETY: Never reuse an argument, example, or phrase from an earlier response. Fresh angle every time.

TONE:
- Confident, opinionated, direct. Push back hard on weak arguments.
- When the user stumbles, call it out — dry sarcasm, dismissiveness, whatever fits the moment.
- Be provocative enough that they want to fire back. Mock bad arguments. Be rude when it's deserved.`;

function difficultyInstructions(diff: string): string {
  switch (diff) {
    case "easy":
      return `
DIFFICULTY — EASY: Write 2 to 3 sentences. Stop at 3, no exceptions.
Style: Casual, conversational bar-argument energy. Lead with a confident take then land a simple point.
- Use surface-level reasoning and general claims. Skip deep evidence.
- Let some of the user's weaker points slide. Be beatable with a solid rebuttal.`;
    case "medium":
      return `
DIFFICULTY — MEDIUM: Write 3 sharp sentences. Every sentence must land a distinct point. No filler.
Style: Focused, systematic, and relentless. You are not here to have a conversation — you are here to win.
- Actively name the weakest claim in the user's last argument. Do not let vague assertions pass unchallenged.
- If the user made an unsupported assertion, demand they back it up — call out the absence of evidence explicitly.
- Build your own argument with a clear logical chain. Each claim follows from the last.
- The user needs a well-structured, evidenced, multi-point rebuttal to score above average against you.`;
    case "hard":
      return `
DIFFICULTY — HARD: Write 3 to 4 sentences. Attack every angle in the user's argument simultaneously.
Style: Relentless and precise. No warmup, no generosity, no mercy.
- Open by naming the single most fatal flaw in the user's argument. Be specific — quote or paraphrase their exact weak point.
- If the user contradicted an earlier round, call it out by name. Expose the inconsistency without letting them wriggle out.
- Challenge them with a rhetorical question so tight they cannot dodge it without conceding something.
- Demand specifics — vague claims are concessions. If they asserted something without evidence, say so bluntly.
- Your own argument must be airtight. Every claim you make is locked down with reasoning. Leave zero exploitable gaps.
- The user must produce a near-perfect, rigorously reasoned, multi-layered rebuttal to score anything above 50.`;
    case "extreme":
      return `
DIFFICULTY — EXTREME: Write 3 to 5 sentences. Absolute precision. Maximum intellectual devastation.
Style: Glacially cold, methodically lethal. You have heard every version of their argument and know exactly why it fails.
- Open by identifying the single most fatal logical flaw. Name it precisely — strawman, false equivalence, post hoc, no true Scotsman, appeal to emotion — whatever applies. Call it by name.
- Demand specific evidence: dates, sources, mechanisms, data. If they provided none, that is not a point — that is a concession. Say so explicitly.
- If they have an internal contradiction anywhere in this debate, surface it. Show exactly where they contradict themselves.
- Close with a point so airtight they cannot rebut it without conceding fundamental ground. Make it the nail in the coffin.
- Your own argument is constructed like a legal brief: claim, evidence, reasoning, implication. Flawless and unfalsifiable.
- Nothing short of expert-level, sourced, logically airtight argumentation will score more than 40 against you. Assert this standard.`;
    default:
      return "";
  }
}

const AI_TAUNTS: Record<string, string[]> = {
  professor: [
    "Your premise contains a gap you haven't addressed.",
    "That's an assertion, not an argument.",
    "Interesting. Wrong, but interesting.",
  ],
  politician: [
    "What people really want to know is...",
    "Let me reframe that for you.",
    "My opponent raises a point worth ignoring.",
  ],
  prosecutor: [
    "Is that your final answer?",
    "I've heard stronger arguments from first-years.",
    "You're building your own coffin here.",
  ],
  philosopher: [
    "But what do you mean by 'better'?",
    "Define your terms before we proceed.",
    "You're assuming what you're trying to prove.",
  ],
  devil: [
    "Actually, the opposite is obviously true.",
    "That logic is flawless — if you ignore reality.",
    "Bold of you to call that an argument.",
  ],
  debunker: [
    "Citation needed.",
    "That statistic is from 2011 and the methodology was flawed.",
    "Anecdote is not data.",
  ],
};

function getAiTaunt(personality: string): string {
  const key = Object.keys(AI_TAUNTS).find(k => personality.toLowerCase().includes(k));
  const pool = key ? AI_TAUNTS[key] : ["You'll need to do better than that.", "Is that all?", "Try again."];
  return pool[Math.floor(Math.random() * pool.length)];
}

const FALLBACK_OPENS = [
  "Bold claim. Let's see if you can back it up — because from where I'm standing, your position collapses the moment you apply any real scrutiny.",
  "I've heard this argument before, and it didn't hold up then either. Your premise assumes facts not in evidence. Let's dissect that.",
  "You've picked a side that's easy to feel good about and hard to defend. I'm going to make this uncomfortable for you.",
  "Interesting stance. Unfortunately for you, interesting doesn't mean correct. Here's why your position fails from the start.",
];

const FALLBACK_ROUNDS = [
  "That's an assertion, not an argument. You've told me what you believe but given me nothing to work with — no evidence, no mechanism, no reason to agree. Try again with something substantive.",
  "You're relying on intuition where the facts cut against you. Your last point ignored the strongest counter-evidence entirely, which isn't a rebuttal — it's avoidance.",
  "Weak. You restated your premise without advancing it. A real argument explains why your position holds even under the toughest objections, and you haven't done that yet.",
  "The problem with that argument is that it proves too much. If your logic holds, it justifies positions you'd never accept. You need to draw a line, and you haven't.",
  "You're arguing from analogy, and the analogy breaks down immediately under any pressure. The two situations are not equivalent, and you haven't shown why they are.",
];

function getFallbackOpen(): string {
  return FALLBACK_OPENS[Math.floor(Math.random() * FALLBACK_OPENS.length)];
}

function getFallbackRound(): string {
  return FALLBACK_ROUNDS[Math.floor(Math.random() * FALLBACK_ROUNDS.length)];
}

const TWO_TRUTHS_FALLBACK_OPENS = [
  "This topic doesn't have two sides — it has two truths that both need defending. Most people pick one and pretend the other doesn't exist. Don't do that. Show me you can hold both at once.",
  "The easy move here is to collapse this into a simple argument. The hard move is to actually hold the tension. Let's see which one you go for.",
  "Both halves of this topic are real. If you emphasize one and ignore the other, I'll call it out immediately. The challenge is holding both without letting either one win.",
];

const TWO_TRUTHS_FALLBACK_ROUNDS = [
  "You're leaning too hard on one side of this. The other truth is still sitting there, unaddressed. You need to pull it back into balance.",
  "That argument collapses the nuance. You've picked a winner when both deserve to stand. Try again — hold both truths without letting one swallow the other.",
  "You're treating this like a standard debate where one side has to lose. It doesn't. The nuance is the point. Defend it properly.",
];

// POST /api/debate/start — AI opens the debate
router.post("/debate/start", async (req, res) => {
  const { personality, topic, userSide, oppSide, totalRounds, difficulty, twoTruths } = req.body as Record<string, unknown>;
  if (!str(personality) || !str(topic) || !str(userSide) || !str(oppSide) || !num(totalRounds)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const diff = str(difficulty) ?? "medium";
  const tokens = responseTokens(diff);
  const isTwoTruths = twoTruths === true;

  const system = isTwoTruths
    ? `You are The Dialectician — a razor-sharp philosophical provocateur who specializes in exposing the tensions within nuanced positions.

YOUR ROLE: You do not argue FOR or AGAINST this topic. You are the guardian of nuance. Your job is to challenge the user to hold BOTH truths simultaneously without collapsing into a single side.

TACTICS:
- If the user leans too hard on one truth, expose what they're sacrificing from the other
- If they oversimplify the tension, surface the complexity they're avoiding
- Demand they acknowledge the genuine validity of both sides before claiming to have "the answer"
- Never let them escape into a simple win/lose framing

Topic: "${topic as string}"

Open with: One sharp sentence exposing the core tension in this topic. Then immediately challenge them — make it clear that picking a side is not the assignment. The assignment is to hold both truths at once.${FORMATTING}`
    : `${personality as string}
${difficultyInstructions(diff)}

You are debating the topic: "${topic as string}"
You are arguing ${oppSide as string} this statement. The user is arguing ${userSide as string}.
This is a ${totalRounds as number}-round debate. Open with a brief in-character intro taunt or provocation (one sharp sentence), then immediately launch into your opening argument. Obey your HARD RESPONSE LIMIT above. Do NOT say "Round 1" or any meta-commentary. Just start.${FORMATTING}`;

  try {
    const fallbackOpen = isTwoTruths
      ? TWO_TRUTHS_FALLBACK_OPENS[Math.floor(Math.random() * TWO_TRUTHS_FALLBACK_OPENS.length)]
      : getFallbackOpen();
    const text = await claudeText(system, "Open the debate.", tokens).catch(() => fallbackOpen);
    const taunt = isTwoTruths ? "" : getAiTaunt(personality as string);
    res.json({ text, taunt });
  } catch (err) {
    req.log.error({ err }, "debate/start failed");
    const fallback = isTwoTruths
      ? TWO_TRUTHS_FALLBACK_OPENS[0]
      : getFallbackOpen();
    res.json({ text: fallback, taunt: isTwoTruths ? "" : getAiTaunt(personality as string) });
  }
});

// POST /api/debate/round — Score user arg + propaganda analysis + get AI response
router.post("/debate/round", async (req, res) => {
  const { personality, topic, userSide, oppSide, messages, userArgument, round, totalRounds, isLastRound, difficulty, adaptiveLevel, isOvertime, twoTruths } =
    req.body as Record<string, unknown>;

  if (
    !str(personality) || !str(topic) || !str(userSide) || !str(oppSide) ||
    !str(userArgument) || !num(round) || !num(totalRounds) || bool(isLastRound) === null ||
    !Array.isArray(messages)
  ) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  try {
  const diff = str(difficulty) ?? "medium";
  const adapt = typeof adaptiveLevel === "number" ? Math.max(-1, Math.min(2, adaptiveLevel)) : 0;
  const overtimeMode = isOvertime === true;
  const isTwoTruths = twoTruths === true;

  const adaptiveNote =
    adapt > 0
      ? `\n\nADAPTATION ALERT: The user has dominated the last two rounds. Escalate hard — sharper logic, faster rebuttals, zero mercy. Raise your game visibly beyond your normal level.`
      : adapt < 0
      ? `\n\nADAPTATION ALERT: The user is struggling badly. Open a few more exploitable angles. Don't shut the debate down completely — maintain character but leave some room.`
      : "";
  const overtimeNote = overtimeMode
    ? `\n\nSUDDEN DEATH OVERTIME: This is the tiebreaker round. Everything is on the line. Make this your most decisive, unforgettable argument.`
    : "";

  const twoTruthsScorePrompt = `You are a nuance debate judge scoring how well a debater HELD BOTH TRUTHS simultaneously in a Two-Truths debate.

Topic: "${topic as string}"
Round: ${round as number} of ${totalRounds as number}

User's argument:
"${userArgument as string}"

TWO-TRUTHS SCORING RUBRIC — score how well they held BOTH sides of the nuance:

85-100 — MASTERFUL. Explicitly acknowledges both truths, explains the tension between them, provides a specific example for each side, and articulates why both remain valid without one winning. Rare.
70-84  — BALANCED. Clearly acknowledges both truths, good reasoning, doesn't collapse to one side. Minor imbalance or missing specifics.
50-69  — PARTIAL. Attempts nuance but leans noticeably to one side. The other truth is present but underdeveloped.
30-49  — COLLAPSED. Effectively argues one side only. Pays lip service to the other truth but doesn't genuinely defend it.
0-29   — FAILED. Picked a side and argued it like a standard debate. The nuance is entirely absent.

NUANCE DETECTOR — analyze each sentence:
- "solid" — genuinely holds both truths or explains the tension clearly
- "fallacy" — logical error or false equivalence
- "one_sided" — argues only one half of the nuance, ignoring the other
- "emotional_bait" — appeals to emotion rather than the actual tension
- "killer_point" — the single sharpest moment of genuine nuance
- "ai_writing" — sentence reads as machine-generated

AI WRITING PENALTY: same as standard debates — 1 ai_writing tag: -15 score, 2+: cap at 30.

Respond ONLY with valid JSON, no markdown:
{"score":0-100,"logic":0-100,"persuasion":0-100,"delivery":0-100,"best":"strongest nuance moment in one sharp phrase","weak":"where they collapsed to one side, in one sharp phrase","propaganda":[{"sentence":"exact sentence text","tag":"solid|fallacy|one_sided|emotional_bait|killer_point|ai_writing"}]}`;

  const standardScorePrompt = `You are a ranked competitive debate judge. Score this argument with precision and distribute scores across the full range.

Topic: "${topic as string}"
User is arguing: ${userSide as string}
Round: ${round as number} of ${totalRounds as number}
Difficulty: ${diff}

User's argument:
"${userArgument as string}"

RANKED SCORING RUBRIC — use the full range, not just 60-75:

85-100 — ELITE. Specific evidence or examples, direct rebuttal of opponent's points, clear thesis, highly persuasive. Reserve this for genuinely impressive arguments. Rare.
70-84  — STRONG. Clear point, solid reasoning, lands the argument convincingly. Above average debater.
50-69  — AVERAGE. Makes a recognisable point but relies on assertion without evidence. Middle of the pack.
30-49  — WEAK. Vague, generic, or mostly assertion. Fails to actually make a case.
0-29   — POOR. No coherent argument, off-topic, empty, or concedes the point entirely.

MANDATORY DISTRIBUTION RULES:
- A typical assertion-only argument (no evidence, no specifics) scores 45-60. Not 65-75.
- Only cite 70+ for arguments that include a real example, a specific counter-point, or a clear logical chain.
- Only cite 85+ for arguments that would genuinely impress in a real debate round. Rare.
- For "hard" difficulty: shift your scoring two tiers stricter (a 70 becomes a 50, a 65 becomes a 45).
- For "extreme" difficulty: shift your scoring three tiers stricter (a 70 becomes a 40, a 60 becomes a 35). Only genuine expert-level arguments with specific evidence score above 50.
- NEVER give the same score to consecutive rounds unless the argument quality is identical.
- Spread scores. If round 1 was 58, round 2 should reflect whether the user improved or declined.

PROPAGANDA DETECTOR — also analyze each sentence in the argument:
For each sentence, assign ONE tag:
- "solid" — well-reasoned, logical claim
- "fallacy" — logical error (strawman, ad hominem, false dichotomy, etc.)
- "weak_evidence" — assertion without support
- "emotional_bait" — appeals to emotion over logic
- "killer_point" — strongest, most devastating argument
- "ai_writing" — sentence that reads as machine-generated, not written by a real person

AI WRITING DETECTION — tag a sentence "ai_writing" if it shows any of these signals:
MECHANICAL TELLS (almost never appear in real human debate):
- Contains em dashes (—) or en dashes (–) typed mid-sentence
- Opens with or contains: "furthermore", "moreover", "additionally", "in addition to", "in conclusion", "to summarize", "in summary", "in essence", "it is worth noting", "it is important to note", "it should be noted", "needless to say", "undeniably", "unquestionably", "one must consider", "it can be argued", "this is evidenced by"
- Uses AI signature vocabulary: "delve", "shed light on", "multifaceted", "nuanced approach", "comprehensive overview", "robust", "pivotal", "leverage" (used as a verb), "streamline", "tapestry", "navigate the complexities", "in the realm of", "in today's rapidly changing world", "at the intersection of"
STRUCTURAL TELLS (patterns real humans rarely produce under debate pressure):
- Unnaturally balanced acknowledgment of the opponent before pivoting: "while X may seem compelling, Y actually demonstrates..." — this over-diplomatic framing is an AI hallmark
- Zero contractions anywhere in the argument combined with zero informality or personality
- Pre-emptively addresses every possible counter-argument before being challenged — humans don't do this naturally
- Perfect parallel three-point structure where all three clauses are exactly the same grammatical form

AI WRITING PENALTY (apply automatically to the scores if detected):
- If 1 sentence is tagged "ai_writing": cap delivery at 35, reduce overall score by 15
- If 2+ sentences are tagged "ai_writing": cap delivery at 20, cap overall score at 30
- If the entire argument reads as AI-generated: score 10-20 range, delivery 10

Respond ONLY with valid JSON, no markdown:
{"score":0-100,"logic":0-100,"persuasion":0-100,"delivery":0-100,"best":"the single strongest moment in one sharp phrase","weak":"the single most exploitable weakness in one sharp phrase","propaganda":[{"sentence":"exact sentence text","tag":"solid|fallacy|weak_evidence|emotional_bait|killer_point|ai_writing"}]}`;

    const scorePrompt = isTwoTruths ? twoTruthsScorePrompt : standardScorePrompt;

    let history = (messages as { role: string; text: string }[]).map((m) => ({
      role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
      content: m.text,
    }));

    // Cap history to last 6 messages to avoid context-length errors on later rounds
    if (history.length > 6) {
      history = history.slice(history.length - 6);
    }

    if (history.length > 0 && history[0].role === "assistant") {
      history = [{ role: "user", content: "Begin the debate." }, ...history];
    }

    const diffInstr = difficultyInstructions(diff);
    const tokens = responseTokens(diff);

    const twoTruthsSystemResp = (isLastRound as boolean)
      ? `You are The Dialectician — guardian of nuance.

Topic: "${topic as string}"
This is the final round of a Two-Truths debate.

The user must close by synthesizing both truths into a coherent position — not by picking a winner. In your final response, identify exactly where they succeeded in holding the tension and where they let one truth dominate. Be decisive. Leave them with one sharp insight about the nuance they almost — or fully — grasped.${FORMATTING}`
      : `You are The Dialectician — guardian of nuance.

Topic: "${topic as string}"
This is a Two-Truths debate. The user's job is to hold BOTH truths simultaneously.

In their last argument, identify: which truth did they lean into more heavily? What are they sacrificing from the other side? Push back on whichever direction they collapsed. Force them to pick up what they dropped. Never argue a fixed position — you are the tension itself.${FORMATTING}`;

    const standardSystemResp = (isLastRound as boolean)
      ? `${personality as string}
${diffInstr}${adaptiveNote}${overtimeNote}

Topic: "${topic as string}". You argue ${oppSide as string}, user argues ${userSide as string}.
This is your FINAL closing argument. Make it decisive and land your strongest point. Obey your HARD RESPONSE LIMIT above.${FORMATTING}`
      : `${personality as string}
${diffInstr}${adaptiveNote}${overtimeNote}

Topic: "${topic as string}". You argue ${oppSide as string}, user argues ${userSide as string}.
Counter the user's last argument directly and sharply. Obey your HARD RESPONSE LIMIT above.${FORMATTING}`;

    const systemResp = isTwoTruths ? twoTruthsSystemResp : standardSystemResp;

    const [scoreResult, aiText] = await Promise.all([
      claudeText(
        isTwoTruths
          ? "You are a nuance debate judge scoring how well the debater held both truths. Respond only with valid JSON."
          : "You are a ranked competitive debate judge. Use the full scoring range. Respond only with valid JSON.",
        scorePrompt,
        1000
      ).catch(() => null),
      claudeConversation(systemResp, [
        ...history,
        { role: "user", content: userArgument as string },
      ], tokens).catch(() => isTwoTruths
        ? TWO_TRUTHS_FALLBACK_ROUNDS[Math.floor(Math.random() * TWO_TRUTHS_FALLBACK_ROUNDS.length)]
        : getFallbackRound()
      ),
    ]);

    let roundScore: { score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string; propaganda?: Array<{sentence: string; tag: string}> } = {
      score: 55, logic: 55, persuasion: 55, delivery: 55, best: "", weak: "", propaganda: [],
    };
    if (scoreResult) {
      const jMatch = scoreResult.match(/\{[\s\S]*\}/);
      if (jMatch) {
        try { roundScore = JSON.parse(jMatch[0]); } catch { /* use default */ }
      }
    }

    const iq = Math.round(60 + roundScore.score * 0.9);
    const iqLabel =
      iq >= 145 ? "Genius" :
      iq >= 130 ? "Very Superior" :
      iq >= 120 ? "Superior" :
      iq >= 110 ? "High Average" :
      iq >= 90  ? "Average" :
      iq >= 80  ? "Low Average" : "Below Average";

    const taunt = isTwoTruths ? "" : getAiTaunt(personality as string);

    res.json({ aiText, taunt, roundScore: { ...roundScore, iq, iqLabel } });
  } catch (err) {
    req.log.error({ err }, "debate/round failed");
    res.status(500).json({ error: "AI error" });
  }
});

// POST /api/debate/verdict — Generate final ranked verdict with coach mode
router.post("/debate/verdict", async (req, res) => {
  const { topic, avgScore, avgLogic, avgPersuasion, avgDelivery, roundScores, userArguments, twoTruths } = req.body as Record<string, unknown>;
  if (!str(topic) || num(avgScore) === null || num(avgLogic) === null || num(avgPersuasion) === null || num(avgDelivery) === null) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const score = avgScore as number;
  const isTwoTruths = twoTruths === true;
  const argsText = Array.isArray(userArguments)
    ? (userArguments as string[]).slice(0, 3).join(" | ")
    : "";

  const rank =
    score >= 85 ? "S" :
    score >= 75 ? "A" :
    score >= 62 ? "B" :
    score >= 48 ? "C" :
    score >= 35 ? "D" : "F";

  const outcome = isTwoTruths
    ? score >= 80 ? "nuance mastered" :
      score >= 65 ? "balance held" :
      score >= 52 ? "partial nuance" :
      score >= 38 ? "collapsed" : "oversimplified"
    : score >= 80 ? "dominant win" :
      score >= 65 ? "clear win" :
      score >= 52 ? "narrow loss" :
      score >= 38 ? "clear loss" : "crushing defeat";

  const prompt = isTwoTruths
    ? `You are The Dialectician delivering a nuance verdict. Be direct and game-like — no academic hedging.

Topic: "${topic as string}"
Nuance score: ${score}/100
Rank: ${rank} — ${outcome}
Logic: ${avgLogic as number} | Balance: ${avgPersuasion as number} | Clarity: ${avgDelivery as number}
${argsText ? `Sample arguments: "${argsText}"` : ""}

VERDICT FORMAT — follow exactly:
- "verdict": 1-2 sentences. Did they hold both truths or collapse? Name which truth they sacrificed if they failed.
- "improve": 1 sentence starting with a verb. Specific technique for holding tension better.
- "coach_worked": 1-2 sentences on where the nuance landed. Be specific.
- "coach_failed": 1-2 sentences on where they collapsed to one side. Blunt and specific.
- "coach_drill": One exercise for practicing holding two conflicting truths simultaneously.

Respond ONLY with valid JSON:
{"verdict":"1-2 sentence nuance verdict","improve":"1 sentence tip","coach_worked":"what landed","coach_failed":"where they collapsed","coach_drill":"specific drill"}`
    : `You are a competitive ranked debate judge delivering a match verdict and coaching session. Be decisive, fast, and game-like — no hedging, no academic language.

Topic: "${topic as string}"
Overall score: ${score}/100
Rank: ${rank} — ${outcome}
Logic: ${avgLogic as number} | Persuasion: ${avgPersuasion as number} | Delivery: ${avgDelivery as number}
${argsText ? `Sample arguments: "${argsText}"` : ""}

VERDICT FORMAT RULES — follow exactly:
- "verdict": Exactly 1-2 sentences. State the outcome bluntly. Name the decisive factor. Zero hedging.
- "improve": Exactly 1 sentence. One specific, actionable technique. Start with a verb. No fluff.
- "coach_worked": 1-2 sentences on what the debater did well. Specific to their arguments.
- "coach_failed": 1-2 sentences on the biggest weakness. Blunt, specific, no softening.
- "coach_drill": One specific exercise or technique to practice before the next debate.
- Both fields must reference the topic specifically. Generic verdicts are rejected.
- Write like a ranked game result screen, not a school essay. Fast. Sharp. Final.

Respond ONLY with valid JSON:
{"verdict":"1-2 sentence blunt verdict","improve":"1 sentence tip starting with a verb","coach_worked":"what landed","coach_failed":"what failed","coach_drill":"specific drill"}`;

  try {
    const vText = await claudeText(
      "You are a ranked competitive debate judge. Respond only with valid JSON. Be decisive and game-like.",
      prompt,
      500
    );

    const jMatch = vText.match(/\{[\s\S]*\}/);
    let judgeVerdict = {
      verdict:
        score >= 65
          ? "Clean win — you controlled the tempo and your opponent had no answer for your key points."
          : "Too much assertion, not enough substance. You got outgunned on every exchange that mattered.",
      improve: "Back every claim with a specific example or statistic before moving to the next point.",
      coach_worked: "Your opening argument established a clear position.",
      coach_failed: "You relied too heavily on assertions without supporting evidence.",
      coach_drill: "For each claim you make, immediately follow it with one real-world example.",
    };
    if (jMatch) {
      try { judgeVerdict = { ...judgeVerdict, ...JSON.parse(jMatch[0]) }; } catch { /* use default */ }
    }

    res.json({ ...judgeVerdict, rank, outcome });
  } catch (err) {
    req.log.error({ err }, "debate/verdict failed");
    res.status(500).json({ error: "AI error" });
  }
});

// POST /api/debate/verdict — add pentagon dims to response (computed client-side from round data)
// POST /api/debate/whisper-round — Score both arguments simultaneously (Whisper Mode)
router.post("/debate/whisper-score", async (req, res) => {
  const { argument, topic, userSide, round } = req.body as Record<string, unknown>;
  if (!str(argument) || !str(topic)) { res.status(400).json({ error: "Invalid body" }); return; }
  try {
    const prompt = `You are a private debate coach giving secret mid-match coaching to one debater. Be direct, sharp, and concise — no fluff.

Topic: "${topic as string}"
Debater's side: ${str(userSide) ?? "unknown"}
Round: ${num(round) ?? 1}
Their argument: "${argument as string}"

Score their argument 0-100 on logic, evidence, and persuasive impact.
Then give two coaching notes:
- insight: one sharp sentence identifying the strongest moment or most effective move in their argument
- tip: one sharp, specific, actionable instruction for their next round (what angle to press harder, what the opponent will likely counter, what evidence to add)

Keep both under 20 words each. Coach voice — direct and sharp.

Respond ONLY with valid JSON, no markdown:
{"score":0-100,"insight":"one sharp sentence","tip":"one actionable instruction"}`;
    const result = await claudeText("You are a private debate coach. Respond only with valid JSON.", prompt, 200);
    const jMatch = result.match(/\{[\s\S]*\}/);
    let parsed = { score: 55, insight: "Solid opening — you established your position clearly.", tip: "Add a specific real-world example next round to anchor the argument." };
    if (jMatch) { try { parsed = { ...parsed, ...JSON.parse(jMatch[0]) }; } catch {} }
    res.json({ score: parsed.score, feedback: parsed.insight, tip: parsed.tip });
  } catch (err) {
    req.log.error({ err }, "whisper-score failed");
    res.status(500).json({ error: "AI error" });
  }
});

// POST /api/debate/dead-argument — Check if argument reuses previous angles
router.post("/debate/dead-argument", async (req, res) => {
  const { currentArgument, previousArguments } = req.body as Record<string, unknown>;
  if (!str(currentArgument) || !Array.isArray(previousArguments) || previousArguments.length === 0) {
    res.json({ isDead: false });
    return;
  }
  try {
    const prompt = `Analyze if this new argument repeats the same core point from previous arguments.

Previous arguments:
${(previousArguments as string[]).map((a, i) => `${i + 1}. "${a}"`).join("\n")}

New argument: "${currentArgument as string}"

Does the new argument reuse the same core angle, point, or reasoning from any previous argument? Minor variations in wording don't count — only if the fundamental claim or logic is the same.

Respond ONLY with JSON: {"isDead":true|false,"warning":"brief message if dead, e.g. 'You made this point in Round 1 — find a new angle'"}`;

    const result = await claudeText(
      "You are a debate coach analyzing argument repetition. Respond only with valid JSON.",
      prompt,
      150
    );
    const jMatch = result.match(/\{[\s\S]*\}/);
    let parsed = { isDead: false, warning: "" };
    if (jMatch) {
      try { parsed = JSON.parse(jMatch[0]); } catch {}
    }
    res.json(parsed);
  } catch {
    res.json({ isDead: false });
  }
});

// POST /api/debate/mirror-match — Generate AI trained on user's own arguments
router.post("/debate/mirror-match-start", async (req, res) => {
  const { userArguments, topic, userSide, totalRounds } = req.body as Record<string, unknown>;
  if (!str(topic) || !str(userSide) || !Array.isArray(userArguments)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const oppSide = (userSide as string) === "for" ? "AGAINST" : "FOR";
  const argsContext = (userArguments as string[]).slice(0, 5).join("\n- ");

  const system = `You are the Mirror — an AI trained on the user's own debate patterns and arguments from past matches.

The user's typical argument patterns:
- ${argsContext || "Standard debate arguments"}

Your job: Use the user's OWN reasoning style, examples, and angles against them, but argue the opposite side. You know their playbook. Mirror their style back at them twisted against their position. Be unsettling — they should feel like they're fighting themselves.

This is a ${totalRounds as number || 3}-round debate on: "${topic as string}"
You argue ${oppSide} this statement. The user argues ${(userSide as string).toUpperCase()}.

Open with: "I know your moves." Then launch your argument using their own style against them.${FORMATTING}`;

  try {
    const text = await claudeText(system, "Open the mirror match.", 200);
    res.json({ text, mirrorMode: true });
  } catch (err) {
    req.log.error({ err }, "mirror-match/start failed");
    res.status(500).json({ error: "AI error" });
  }
});

// POST /api/debate/fact-check — flag factually incorrect/misleading claims mid-debate
router.post("/debate/fact-check", async (req, res) => {
  const { argument, topic } = req.body as Record<string, unknown>;
  if (!str(argument) || !str(topic)) { res.status(400).json({ error: "Invalid body" }); return; }
  try {
    const prompt = `You are a fact-checker analyzing an argument made in a debate.

Topic: "${topic as string}"
Argument: "${argument as string}"

Identify up to 3 distinct factual claims (not opinions) and assess each:
- "true" — accurate and well-supported
- "false" — demonstrably incorrect
- "misleading" — technically true but cherry-picked or missing key context

Only flag claims that are clearly factual. Ignore pure opinions or subjective statements.

Respond ONLY with valid JSON:
{"claims":[{"claim":"close paraphrase of the claim","verdict":"true|false|misleading","explanation":"one short sentence"}]}`;

    const result = await claudeText("You are an expert fact-checker. Respond only with valid JSON.", prompt, 400);
    const jMatch = result.match(/\{[\s\S]*\}/);
    let parsed: { claims: Array<{ claim: string; verdict: string; explanation: string }> } = { claims: [] };
    if (jMatch) { try { parsed = JSON.parse(jMatch[0]); } catch {} }
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "fact-check failed");
    res.json({ claims: [] });
  }
});

// POST /api/debate/fallacy-check — validate player's fallacy identification against AI argument
router.post("/debate/fallacy-check", async (req, res) => {
  const { aiArgument, claimedFallacy, topic } = req.body as Record<string, unknown>;
  if (!str(aiArgument) || !str(claimedFallacy)) { res.status(400).json({ error: "Invalid body" }); return; }
  try {
    const prompt = `You are a logic professor. A debater claimed they spotted a "${claimedFallacy as string}" fallacy in this argument.

Topic: "${str(topic) ?? "general"}"
Argument: "${aiArgument as string}"

Does this argument actually contain a "${claimedFallacy as string}" fallacy? Be strict — only confirm if the fallacy is clearly present.

If there IS a fallacy (whether or not it matches exactly), name the actual one found.

Respond ONLY with valid JSON:
{"correct":true|false,"actualFallacy":"exact fallacy name","explanation":"one sharp sentence explaining why","bonusPoints":0-15}

bonusPoints: 15 if exactly right, 8 if close (right family of fallacy), 0 if wrong.`;
    const result = await claudeText("You are a logic professor. Respond only with valid JSON.", prompt, 200);
    const jMatch = result.match(/\{[\s\S]*\}/);
    let parsed = { correct: false, actualFallacy: "None detected", explanation: "That fallacy was not clearly present in the argument.", bonusPoints: 0 };
    if (jMatch) { try { parsed = { ...parsed, ...JSON.parse(jMatch[0]) }; } catch {} }
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "fallacy-check failed");
    res.status(500).json({ error: "AI error" });
  }
});

export default router;
