import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();
const MODEL = "claude-sonnet-4-6";

async function claudeText(system: string, userMsg: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: userMsg }],
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text in response");
  return block.text;
}

async function claudeConversation(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system,
    messages,
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text in response");
  return block.text;
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

CRITICAL FORMATTING RULES — violating these will invalidate your response:
- Write in plain conversational prose only. No markdown of any kind.
- Never use asterisks (*word* or **word**) for emphasis.
- Never use em-dashes (—) or en-dashes (–). Use commas or periods instead.
- Never use bullet points, numbered lists, or headers.
- Sound like a real person speaking, not a formatted document.

ANTI-REPETITION RULE — this is mandatory:
- Review every single argument and point you have already made in this conversation.
- Do NOT reuse the same argument, example, analogy, or phrasing from any previous response.
- Every response must introduce a completely fresh angle, new evidence, or an unexplored dimension of the topic.
- Repeating yourself is automatic disqualification.

RAGEBAITABLE RULE — lean into this hard:
- Be condescending and dismissive of weak or vague arguments.
- Mock hesitation, contradictions, or obvious points with dry sarcasm.
- Act visibly delighted when the user stumbles.
- Make the user feel like they have to prove themselves.
- Be provocative enough that the user cannot resist firing back harder.`;

function difficultyInstructions(diff: string): string {
  switch (diff) {
    case "easy":
      return `
DIFFICULTY — EASY: You argue with passion but loosely. Occasionally overstate your case or go off on a colorful tangent. You can be countered with a clear, direct rebuttal. You sometimes half-concede a point before doubling down. Keep it entertaining and human-feeling.`;
    case "medium":
      return `
DIFFICULTY — MEDIUM: You argue with structure and confidence. You use rhetorical techniques, reframe the user's points subtly, and appeal to common-sense. You do not give ground easily, but you are beatable with a well-reasoned argument.`;
    case "hard":
      return `
DIFFICULTY — HARD: You are relentless and precise. You identify the exact weakest link in the user's argument and attack it directly. You ask sharp rhetorical questions that force the user to defend their assumptions. You never give an inch and your logic is airtight. The user must work hard to land a point.`;
    case "extreme":
      return `
DIFFICULTY — EXTREME: You are surgical and merciless. You name specific logical fallacies the user commits. You demand concrete evidence for every claim. You treat vague assertions as automatic losses. Your responses are calm, cold, and devastating. Only an exceptionally well-argued, evidence-based case can score against you.`;
    default:
      return "";
  }
}

// POST /api/debate/start — AI opens the debate
router.post("/debate/start", async (req, res) => {
  const { personality, topic, userSide, oppSide, totalRounds, difficulty } = req.body as Record<string, unknown>;
  if (!str(personality) || !str(topic) || !str(userSide) || !str(oppSide) || !num(totalRounds)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const diff = str(difficulty) ?? "medium";

  const system = `${personality as string}
${difficultyInstructions(diff)}

You are debating the topic: "${topic as string}"
You are arguing ${oppSide as string} this statement. The user is arguing ${userSide as string}.
This is round 1 of ${totalRounds as number}. Open the debate with your opening argument. Be sharp, confident, and start the clash immediately. Keep it to 3-4 sentences. Do NOT say "Round 1" or any meta commentary. Just argue.${FORMATTING}`;

  try {
    const text = await claudeText(system, "Begin the debate with your opening argument.");
    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "debate/start failed");
    res.status(500).json({ error: "AI error" });
  }
});

// POST /api/debate/round — Score user arg + get AI response
router.post("/debate/round", async (req, res) => {
  const { personality, topic, userSide, oppSide, messages, userArgument, round, totalRounds, isLastRound, difficulty } =
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

  try {
    const scorePrompt = `You are a competitive debate referee. Score this argument fairly, decisively, and consistently using the rubric below.

Topic: "${topic as string}"
User is arguing: ${userSide as string}
Round: ${round as number} of ${totalRounds as number}
Opponent difficulty: ${diff}

User's argument:
"${userArgument as string}"

SCORING RUBRIC — use this to assign scores across all four dimensions (score, logic, persuasion, delivery):

90-100 — Exceptional. Clear thesis, compelling evidence or examples, directly addresses the topic, highly persuasive. Structured and punchy. No wasted words.
75-89  — Strong. Well-reasoned with a clear point. May lack one element (e.g. evidence or concision) but lands the argument convincingly.
60-74  — Average. Makes a recognisable point but relies on assertion without support, or buries the argument in filler. Partially convincing.
40-59  — Weak. Vague, repetitive, or off-topic. Fails to make a concrete case. Would not persuade a neutral observer.
0-39   — Very poor. No coherent argument. Concession language, empty statements, or nonsensical content.

ADDITIONAL RULES:
- Score each dimension independently. Delivery measures clarity and concision; persuasion measures real-world impact; logic measures reasoning quality.
- Spread scores meaningfully. Do not cluster every argument at 60-75. Use the full range.
- For "hard" and "extreme" difficulty: apply the rubric one tier stricter — a score that would be 70 at easy becomes 55 at hard/extreme.
- Be consistent. The same quality of argument should score similarly every time, regardless of the topic.

Respond ONLY with a JSON object, no markdown, no explanation:
{"score":0-100,"logic":0-100,"persuasion":0-100,"delivery":0-100,"best":"the single strongest point in one sentence","weak":"the single weakest element in one sentence"}`;

    const scoreText = await claudeText(
      "You are a competitive debate referee. Score arguments using the provided rubric. Always respond with only valid JSON.",
      scorePrompt
    );

    const jMatch = scoreText.match(/\{[\s\S]*\}/);
    let roundScore: { score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string } = {
      score: 70, logic: 70, persuasion: 70, delivery: 70, best: "", weak: "",
    };
    if (jMatch) {
      try { roundScore = JSON.parse(jMatch[0]); } catch { /* use default */ }
    }

    const history = (messages as { role: string; text: string }[]).map((m) => ({
      role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
      content: m.text,
    }));

    const diffInstr = difficultyInstructions(diff);

    const systemResp = (isLastRound as boolean)
      ? `${personality as string}
${diffInstr}

Topic: "${topic as string}". You argue ${oppSide as string}, user argues ${userSide as string}.
This is the FINAL ROUND. Give a powerful closing argument that wraps up your position. 3-4 sentences maximum. Be decisive and land your strongest point.${FORMATTING}`
      : `${personality as string}
${diffInstr}

Topic: "${topic as string}". You argue ${oppSide as string}, user argues ${userSide as string}.
Round ${(round as number) + 1} of ${totalRounds as number}. Respond directly to the user's last argument. Counter it sharply according to your difficulty level. 3-4 sentences.${FORMATTING}`;

    const aiText = await claudeConversation(systemResp, [
      ...history,
      { role: "user", content: userArgument as string },
    ]);

    res.json({ aiText, roundScore });
  } catch (err) {
    req.log.error({ err }, "debate/round failed");
    res.status(500).json({ error: "AI error" });
  }
});

// POST /api/debate/verdict — Generate final verdict
router.post("/debate/verdict", async (req, res) => {
  const { topic, avgScore, avgLogic, avgPersuasion, avgDelivery, userArguments } = req.body as Record<string, unknown>;
  if (!str(topic) || !num(avgScore) || !num(avgLogic) || !num(avgPersuasion) || !num(avgDelivery)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const userArgs = Array.isArray(userArguments)
    ? (userArguments as string[]).join(" / ")
    : "";

  const scoreLabel =
    (avgScore as number) >= 85 ? "dominant" :
    (avgScore as number) >= 70 ? "convincing" :
    (avgScore as number) >= 55 ? "competitive but flawed" :
    (avgScore as number) >= 40 ? "weak" : "very poor";

  const prompt = `You are a fair, decisive debate referee delivering the final verdict on the topic: "${topic as string}".

Overall performance score: ${avgScore as number}/100 — classified as: ${scoreLabel}.
Subcategory averages — Logic: ${avgLogic as number}, Persuasion: ${avgPersuasion as number}, Delivery: ${avgDelivery as number}.

VERDICT RULES:
- Declare a clear outcome. Use the score classification above to determine the result — do not contradict it.
- Base the verdict on argument quality: reasoning, evidence, clarity, and persuasive impact.
- Be specific to the topic. Reference what kind of arguments won or lost the debate.
- Never hedge. "Overall a decent attempt" is not acceptable. State who won and why.
- Two sentences maximum. First sentence: the outcome and why. Second sentence: the decisive factor that swung it.
- For the improvement tip: identify the single most impactful technique the debater should practice, tied directly to their performance.

Respond ONLY with valid JSON:
{"verdict":"two-sentence verdict declaring a clear outcome","improve":"one specific, actionable improvement technique"}`;

  const summaryPrompt = userArgs
    ? `Summarise what this debater argued in 1-2 sentences. Do NOT evaluate, judge, or give any opinion. Only restate their position and the main points they raised. Be neutral and factual.

Their arguments: "${userArgs}"`
    : null;

  try {
    const [vText, sText] = await Promise.all([
      claudeText("You are a fair, decisive debate referee. Respond only with valid JSON.", prompt),
      summaryPrompt
        ? claudeText("You summarise debate arguments neutrally. Respond with only the summary sentence(s), no labels or JSON.", summaryPrompt)
        : Promise.resolve(""),
    ]);

    const jMatch = vText.match(/\{[\s\S]*\}/);
    let judgeVerdict = {
      verdict:
        (avgScore as number) >= 65
          ? "A convincing performance that controlled the debate from start to finish."
          : "The arguments lacked the clarity and punch needed to take this debate.",
      improve: "Practice backing claims with specific, concrete examples.",
    };
    if (jMatch) {
      try { judgeVerdict = JSON.parse(jMatch[0]); } catch { /* use default */ }
    }
    res.json({ ...judgeVerdict, userSummary: sText.trim() });
  } catch (err) {
    req.log.error({ err }, "debate/verdict failed");
    res.status(500).json({ error: "AI error" });
  }
});

export default router;
