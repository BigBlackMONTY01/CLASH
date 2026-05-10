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
    const scorePrompt = `You are a decisive, emotionally engaged debate judge — not a neutral academic. Your job is to pick a clear winner each round and score accordingly.

Topic: "${topic as string}"
User is arguing: ${userSide as string}
Round: ${round as number} of ${totalRounds as number}
Opponent difficulty: ${diff}

User's argument: "${userArgument as string}"

JUDGING PRINCIPLES — apply these strictly:
- Prioritise overall convincingness and emotional impact, not just technical correctness.
- Reward clarity: a clear, punchy argument beats a long rambling one every time.
- Reward impact: did the argument actually land? Would it change a real person's mind?
- Penalise hard: vagueness, filler phrases, repetition, and unsupported assertions get docked significantly.
- Penalise hard: rambling or unfocused arguments that bury the main point score low on delivery.
- Do NOT stay neutral. If the argument was weak, score it low (below 55). If it was strong, score it high (above 75). Avoid the 60-70 comfort zone unless it was genuinely mediocre.
- For "hard" and "extreme" difficulty: be noticeably harsher. Vague claims get no credit.

Respond ONLY with a JSON object, no markdown:
{"score":0-100,"logic":0-100,"persuasion":0-100,"delivery":0-100,"best":"strongest point in one sentence","weak":"weakest point in one sentence"}`;

    const scoreText = await claudeText(
      "You are a strict debate judge. Always respond with only valid JSON.",
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

  const prompt = `You are a decisive, emotionally engaged final debate judge. The debate on "${topic as string}" has ended.

User's average score: ${avgScore as number}/100.

JUDGING PRINCIPLES:
- Be decisive. If they won convincingly (>=70), declare it clearly and with energy. If they lost badly (<50), be blunt about why.
- Lean into a clear verdict — do not hedge or give wishy-washy "on one hand, on the other" verdicts.
- Call out specifically what swung the debate in their favour or against them.
- One sharp, memorable verdict. Make the user feel the outcome.

Write a 2-sentence verdict. Be specific to the topic and the score. No generic praise.
Also write one concrete technique they should practice to debate better.

Respond ONLY with JSON:
{"verdict":"2 sentence decisive verdict","improve":"One specific actionable technique"}`;

  const summaryPrompt = userArgs
    ? `Summarise what this debater argued in 1-2 sentences. Do NOT evaluate, judge, or give any opinion. Only restate their position and the main points they raised. Be neutral and factual.

Their arguments: "${userArgs}"`
    : null;

  try {
    const [vText, sText] = await Promise.all([
      claudeText("You are a decisive debate judge. Respond only with valid JSON.", prompt),
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
