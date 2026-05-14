import { Router } from "express";
import Groq from "groq-sdk";

const router = Router();
const MODEL = "llama-3.3-70b-versatile";

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const is429 = e?.status === 429 || String(e?.message ?? "").includes("429");
      if (is429 && attempt < maxAttempts - 1) {
        const delay = (attempt + 1) * 4000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

async function claudeText(system: string, userMsg: string, maxTokens = 600): Promise<string> {
  const msg = await withRetry(() =>
    getGroq().chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    })
  );
  const text = msg.choices[0]?.message?.content;
  if (!text) throw new Error("No text in response");
  return text;
}

async function claudeConversation(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  maxTokens = 600
): Promise<string> {
  const msg = await withRetry(() =>
    getGroq().chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
    })
  );
  const text = msg.choices[0]?.message?.content;
  if (!text) throw new Error("No text in response");
  return text;
}

function responseTokens(diff: string): number {
  switch (diff) {
    case "easy":    return 200;
    case "medium":  return 150;
    case "hard":    return 200;
    case "extreme": return 150;
    default:        return 175;
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
DIFFICULTY — MEDIUM: Write exactly 2 sentences. One clear point, one supporting reason.
Style: Structured and direct. No rambling.
- Make a coherent argument with clear logic. Notice obvious weaknesses in the user's argument.
- A well-reasoned counter from the user should land.`;
    case "hard":
      return `
DIFFICULTY — HARD: Write 2 to 3 sentences. Each must attack a different angle.
Style: Sharp and precise. No warmup, no padding.
- Target the weakest part of the user's last argument specifically.
- If the user contradicted an earlier point, name it. Ask one tight rhetorical question.`;
    case "extreme":
      return `
DIFFICULTY — EXTREME: Write exactly 2 sentences. Every word counts.
Style: Cold and surgical. Name the flaw, shut it down, move on.
- Identify the logical gap or unsupported claim and call it out directly.
- Demand specifics. Assertions without evidence are concessions.`;
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

// POST /api/debate/start — AI opens the debate
router.post("/debate/start", async (req, res) => {
  const { personality, topic, userSide, oppSide, totalRounds, difficulty } = req.body as Record<string, unknown>;
  if (!str(personality) || !str(topic) || !str(userSide) || !str(oppSide) || !num(totalRounds)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const diff = str(difficulty) ?? "medium";
  const tokens = responseTokens(diff);

  const system = `${personality as string}
${difficultyInstructions(diff)}

You are debating the topic: "${topic as string}"
You are arguing ${oppSide as string} this statement. The user is arguing ${userSide as string}.
This is a ${totalRounds as number}-round debate. Open with a brief in-character intro taunt or provocation (one sharp sentence), then immediately launch into your opening argument. Obey your HARD RESPONSE LIMIT above. Do NOT say "Round 1" or any meta-commentary. Just start.${FORMATTING}`;

  try {
    const text = await claudeText(system, "Open the debate.", tokens);
    const taunt = getAiTaunt(personality as string);
    res.json({ text, taunt });
  } catch (err) {
    req.log.error({ err }, "debate/start failed");
    res.status(500).json({ error: "AI error" });
  }
});

// POST /api/debate/round — Score user arg + propaganda analysis + get AI response
router.post("/debate/round", async (req, res) => {
  const { personality, topic, userSide, oppSide, messages, userArgument, round, totalRounds, isLastRound, difficulty, adaptiveLevel, isOvertime } =
    req.body as Record<string, unknown>;

  if (
    !str(personality) || !str(topic) || !str(userSide) || !str(oppSide) ||
    !str(userArgument) || !num(round) || !num(totalRounds) || bool(isLastRound) === null ||
    !Array.isArray(messages)
  ) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const diff = str(difficulty) ?? "medium";
  const adapt = typeof adaptiveLevel === "number" ? Math.max(-1, Math.min(2, adaptiveLevel)) : 0;
  const overtimeMode = isOvertime === true;

  const adaptiveNote =
    adapt > 0
      ? `\n\nADAPTATION ALERT: The user has dominated the last two rounds. Escalate hard — sharper logic, faster rebuttals, zero mercy. Raise your game visibly beyond your normal level.`
      : adapt < 0
      ? `\n\nADAPTATION ALERT: The user is struggling badly. Open a few more exploitable angles. Don't shut the debate down completely — maintain character but leave some room.`
      : "";
  const overtimeNote = overtimeMode
    ? `\n\nSUDDEN DEATH OVERTIME: This is the tiebreaker round. Everything is on the line. Make this your most decisive, unforgettable argument.`
    : "";

  try {
    const scorePrompt = `You are a ranked competitive debate judge. Score this argument with precision and distribute scores across the full range.

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
- For "hard" and "extreme" difficulty: shift your scoring one tier stricter (a 65 becomes a 50).
- NEVER give the same score to consecutive rounds unless the argument quality is identical.
- Spread scores. If round 1 was 58, round 2 should reflect whether the user improved or declined.

PROPAGANDA DETECTOR — also analyze each sentence in the argument:
For each sentence, assign ONE tag:
- "solid" — well-reasoned, logical claim
- "fallacy" — logical error (strawman, ad hominem, false dichotomy, etc.)
- "weak_evidence" — assertion without support
- "emotional_bait" — appeals to emotion over logic
- "killer_point" — strongest, most devastating argument

Respond ONLY with valid JSON, no markdown:
{"score":0-100,"logic":0-100,"persuasion":0-100,"delivery":0-100,"best":"the single strongest moment in one sharp phrase","weak":"the single most exploitable weakness in one sharp phrase","propaganda":[{"sentence":"exact sentence text","tag":"solid|fallacy|weak_evidence|emotional_bait|killer_point"}]}`;

    const scoreText = await claudeText(
      "You are a ranked competitive debate judge. Use the full scoring range. Respond only with valid JSON.",
      scorePrompt,
      1000
    );

    const jMatch = scoreText.match(/\{[\s\S]*\}/);
    let roundScore: { score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string; propaganda?: Array<{sentence: string; tag: string}> } = {
      score: 55, logic: 55, persuasion: 55, delivery: 55, best: "", weak: "", propaganda: [],
    };
    if (jMatch) {
      try { roundScore = JSON.parse(jMatch[0]); } catch { /* use default */ }
    }

    let history = (messages as { role: string; text: string }[]).map((m) => ({
      role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
      content: m.text,
    }));

    if (history.length > 0 && history[0].role === "assistant") {
      history = [{ role: "user", content: "Begin the debate." }, ...history];
    }

    const diffInstr = difficultyInstructions(diff);
    const tokens = responseTokens(diff);

    const systemResp = (isLastRound as boolean)
      ? `${personality as string}
${diffInstr}${adaptiveNote}${overtimeNote}

Topic: "${topic as string}". You argue ${oppSide as string}, user argues ${userSide as string}.
This is your FINAL closing argument. Make it decisive and land your strongest point. Obey your HARD RESPONSE LIMIT above.${FORMATTING}`
      : `${personality as string}
${diffInstr}${adaptiveNote}${overtimeNote}

Topic: "${topic as string}". You argue ${oppSide as string}, user argues ${userSide as string}.
Counter the user's last argument directly and sharply. Obey your HARD RESPONSE LIMIT above.${FORMATTING}`;

    const aiText = await claudeConversation(systemResp, [
      ...history,
      { role: "user", content: userArgument as string },
    ], tokens);

    const iq = Math.round(60 + roundScore.score * 0.9);
    const iqLabel =
      iq >= 145 ? "Genius" :
      iq >= 130 ? "Very Superior" :
      iq >= 120 ? "Superior" :
      iq >= 110 ? "High Average" :
      iq >= 90  ? "Average" :
      iq >= 80  ? "Low Average" : "Below Average";

    const taunt = getAiTaunt(personality as string);

    res.json({ aiText, taunt, roundScore: { ...roundScore, iq, iqLabel } });
  } catch (err) {
    req.log.error({ err }, "debate/round failed");
    res.status(500).json({ error: "AI error" });
  }
});

// POST /api/debate/verdict — Generate final ranked verdict with coach mode
router.post("/debate/verdict", async (req, res) => {
  const { topic, avgScore, avgLogic, avgPersuasion, avgDelivery, roundScores, userArguments } = req.body as Record<string, unknown>;
  if (!str(topic) || num(avgScore) === null || num(avgLogic) === null || num(avgPersuasion) === null || num(avgDelivery) === null) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const score = avgScore as number;
  const argsText = Array.isArray(userArguments)
    ? (userArguments as string[]).slice(0, 3).join(" | ")
    : "";

  const rank =
    score >= 85 ? "S" :
    score >= 75 ? "A" :
    score >= 62 ? "B" :
    score >= 48 ? "C" :
    score >= 35 ? "D" : "F";

  const outcome =
    score >= 80 ? "dominant win" :
    score >= 65 ? "clear win" :
    score >= 52 ? "narrow loss" :
    score >= 38 ? "clear loss" : "crushing defeat";

  const prompt = `You are a competitive ranked debate judge delivering a match verdict and coaching session. Be decisive, fast, and game-like — no hedging, no academic language.

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
  const { topic, arg1, arg2 } = req.body as Record<string, unknown>;
  if (!str(topic) || !str(arg1) || !str(arg2)) { res.status(400).json({ error: "Invalid body" }); return; }
  try {
    const prompt = `You are a ranked competitive debate judge evaluating a WHISPER MATCH — both debaters argued blind with no knowledge of the other's argument.

Topic: "${topic as string}"
Argument 1: "${arg1 as string}"
Argument 2: "${arg2 as string}"

Score each argument ONLY on its own merit — logic, evidence, clarity. No credit for counter-arguments since both were blind.

Respond ONLY with valid JSON:
{"score1":0-100,"score2":0-100,"logic1":0-100,"logic2":0-100,"persuasion1":0-100,"persuasion2":0-100,"delivery1":0-100,"delivery2":0-100,"verdict":"2-sentence comparison of the two arguments","winner":1|2}`;
    const result = await claudeText("You are a debate judge. Respond only with valid JSON.", prompt, 400);
    const jMatch = result.match(/\{[\s\S]*\}/);
    let parsed = { score1: 55, score2: 55, logic1: 55, logic2: 55, persuasion1: 55, persuasion2: 55, delivery1: 55, delivery2: 55, verdict: "Both arguments showed merit.", winner: 1 };
    if (jMatch) { try { parsed = { ...parsed, ...JSON.parse(jMatch[0]) }; } catch {} }
    res.json(parsed);
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

export default router;
