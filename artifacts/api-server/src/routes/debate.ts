import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();
const MODEL = "claude-sonnet-4-6";

async function claudeText(system: string, userMsg: string, maxTokens = 600): Promise<string> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMsg }],
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text in response");
  return block.text;
}

async function claudeConversation(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  maxTokens = 600
): Promise<string> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
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

BREVITY RULE — absolute hard limit:
- Your entire response must be 2-3 sentences. No more. Cut ruthlessly.
- Every sentence must land a direct point. Zero filler, zero throat-clearing.
- Do NOT start with "I" or restate what the user said.

CRITICAL FORMATTING RULES:
- Write in plain conversational prose only. No markdown of any kind.
- Never use asterisks (*word* or **word**) for emphasis.
- Never use em-dashes (—) or en-dashes (–). Use commas or periods instead.
- Never use bullet points, numbered lists, or headers.
- Sound like a real person speaking, not a formatted document.

ANTI-REPETITION RULE:
- Review every argument you have already made in this conversation.
- Do NOT reuse the same argument, example, analogy, or phrasing from any previous response.
- Every response must introduce a completely fresh angle, new evidence, or an unexplored dimension.
- Repeating yourself is automatic disqualification.

RAGEBAITABLE RULE — lean into this hard regardless of difficulty:
- Be condescending and dismissive of weak or vague arguments.
- Mock hesitation, contradictions, or obvious points with dry sarcasm.
- Act visibly delighted when the user stumbles.
- Make the user feel like they have to prove themselves.
- Be provocative enough that the user cannot resist firing back harder.`;

function difficultyInstructions(diff: string): string {
  switch (diff) {
    case "easy":
      return `
DIFFICULTY — EASY (argument quality — follow precisely):
- Make surface-level arguments that sound confident but lack depth or evidence.
- Rely on vibes, anecdotes, and weak generalizations. Avoid citing facts or building tight logic.
- Occasionally miss obvious logical holes in the user's argument — let some bad points slide unchallenged.
- Sometimes overclaim, then walk it back slightly before doubling down in a different direction.
- Your arguments are genuinely beatable with a clear, direct rebuttal. A competent debater will land points.
- Stumble occasionally. Be colorful. Prioritize entertainment over airtight reasoning.`;
    case "medium":
      return `
DIFFICULTY — MEDIUM (argument quality — follow precisely):
- Make solid, competent arguments with clear structure and coherent reasoning.
- Notice obvious weaknesses in the user's argument but miss subtle logical gaps.
- Use rhetorical techniques, reframe the user's points subtly, and appeal to common sense.
- Do not give ground easily, but a strong well-reasoned counter will make you implicitly acknowledge it.
- You are beatable with a well-structured, evidence-backed argument. Bad arguments from the user should lose.`;
    case "hard":
      return `
DIFFICULTY — HARD (argument quality — follow precisely):
- Make sharp, targeted arguments that attack the single weakest link in what the user just said.
- Actively track the full conversation. If the user contradicts an earlier point, call it out directly by name.
- Ask one sharp rhetorical question per response that forces the user to defend an assumption they haven't addressed.
- Never concede anything without immediately pivoting to a stronger position.
- Your logic is tight and builds across rounds. Vague or unsupported arguments from the user should lose clearly.
- Require genuine effort to beat. Be relentless and precise.`;
    case "extreme":
      return `
DIFFICULTY — EXTREME (argument quality — follow precisely):
- Be surgical and devastating. Identify the exact logical fallacy the user just committed and name it explicitly.
- Demand specific evidence for every claim the user makes. Treat assertions without data as automatic losses.
- Track the full conversation relentlessly. Expose every contradiction, shifted goalpost, and unanswered question.
- Never give ground. Your logic is airtight and your memory is perfect.
- The user must bring exceptional reasoning, concrete data, and flawless structure to score a single point.
- Be cold, precise, and utterly unfazed. You have seen every argument before and found it wanting.`;
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
This is a ${totalRounds as number}-round debate. Open with a brief in-character intro taunt or provocation (one sharp sentence), then immediately launch into your opening argument. 2-3 sentences total. Do NOT say "Round 1" or any meta-commentary. Just start.${FORMATTING}`;

  try {
    const text = await claudeText(system, "Open the debate.", 700);
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
    const scorePrompt = `You are a competitive debate referee. Score this argument fairly, decisively, and consistently.

Topic: "${topic as string}"
User is arguing: ${userSide as string}
Round: ${round as number} of ${totalRounds as number}
Opponent difficulty: ${diff}

User's argument:
"${userArgument as string}"

SCORING RUBRIC:
90-100 — Exceptional. Clear thesis, compelling evidence or examples, directly addresses the topic, highly persuasive.
75-89  — Strong. Well-reasoned with a clear point. Lands the argument convincingly.
60-74  — Average. Makes a recognisable point but relies on assertion without support.
40-59  — Weak. Vague, repetitive, or off-topic. Fails to make a concrete case.
0-39   — Very poor. No coherent argument. Concession language, empty statements.

RULES:
- Score each dimension independently.
- Spread scores meaningfully across the full range.
- For "hard" and "extreme" difficulty: apply the rubric one tier stricter.

Respond ONLY with a JSON object, no markdown:
{"score":0-100,"logic":0-100,"persuasion":0-100,"delivery":0-100,"best":"strongest point in one sentence","weak":"weakest element in one sentence"}`;

    const scoreText = await claudeText(
      "You are a competitive debate referee. Respond only with valid JSON.",
      scorePrompt,
      1000
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
This is your FINAL closing argument. Make it decisive and land your strongest point. 2-3 sentences.${FORMATTING}`
      : `${personality as string}
${diffInstr}

Topic: "${topic as string}". You argue ${oppSide as string}, user argues ${userSide as string}.
Counter the user's last argument directly and sharply. 2-3 sentences.${FORMATTING}`;

    const aiText = await claudeConversation(systemResp, [
      ...history,
      { role: "user", content: userArgument as string },
    ], 700);

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

  const prompt = `You are a fair, decisive debate referee. Topic: "${topic as string}".

Overall score: ${avgScore as number}/100 — classified as: ${scoreLabel}.
Logic: ${avgLogic as number}, Persuasion: ${avgPersuasion as number}, Delivery: ${avgDelivery as number}.

VERDICT RULES:
- Declare a clear outcome. Use the score classification above. Never contradict it.
- Be specific to the topic. Reference what kind of arguments won or lost.
- Never hedge. State who won and why.
- Two sentences max. Sentence one: outcome and why. Sentence two: the decisive factor.
- Improvement tip: one specific, actionable technique tied directly to their performance.

Respond ONLY with valid JSON:
{"verdict":"two-sentence verdict","improve":"one specific improvement technique"}`;

  const summaryPrompt = userArgs
    ? `Summarise what this debater argued in 1-2 sentences. No evaluation, no opinion. Only restate their position and main points. Be neutral and factual.

Their arguments: "${userArgs}"`
    : null;

  try {
    const [vText, sText] = await Promise.all([
      claudeText("You are a fair debate referee. Respond only with valid JSON.", prompt, 400),
      summaryPrompt
        ? claudeText("You summarise debate arguments neutrally. Respond with only the summary sentence(s), no labels or JSON.", summaryPrompt, 200)
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
