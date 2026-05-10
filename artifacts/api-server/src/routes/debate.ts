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

Respond ONLY with valid JSON, no markdown:
{"score":0-100,"logic":0-100,"persuasion":0-100,"delivery":0-100,"best":"the single strongest moment in one sharp phrase","weak":"the single most exploitable weakness in one sharp phrase"}`;

    const scoreText = await claudeText(
      "You are a ranked competitive debate judge. Use the full scoring range. Respond only with valid JSON.",
      scorePrompt,
      800
    );

    const jMatch = scoreText.match(/\{[\s\S]*\}/);
    let roundScore: { score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string } = {
      score: 55, logic: 55, persuasion: 55, delivery: 55, best: "", weak: "",
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

// POST /api/debate/verdict — Generate final ranked verdict
router.post("/debate/verdict", async (req, res) => {
  const { topic, avgScore, avgLogic, avgPersuasion, avgDelivery, roundScores } = req.body as Record<string, unknown>;
  if (!str(topic) || !num(avgScore) || !num(avgLogic) || !num(avgPersuasion) || !num(avgDelivery)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const score = avgScore as number;

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

  const prompt = `You are a competitive ranked debate judge delivering a match verdict. Be decisive, fast, and game-like — no hedging, no academic language.

Topic: "${topic as string}"
Overall score: ${score}/100
Rank: ${rank} — ${outcome}
Logic: ${avgLogic as number} | Persuasion: ${avgPersuasion as number} | Delivery: ${avgDelivery as number}

VERDICT FORMAT RULES — follow exactly:
- "verdict": Exactly 1-2 sentences. State the outcome bluntly. Name the decisive factor. Zero hedging.
- "improve": Exactly 1 sentence. One specific, actionable technique. Start with a verb. No fluff.
- Both fields must reference the topic specifically. Generic verdicts are rejected.
- Write like a ranked game result screen, not a school essay. Fast. Sharp. Final.

Examples of GOOD verdicts (match this energy):
- "You dominated this debate with a clear command of the evidence. The opponent never recovered from your second-round counter."
- "A sloppy performance — you argued with confidence but zero substance to back it up."

Examples of BAD verdicts (avoid these):
- "Overall, this was a decent attempt with some good moments..."
- "While you made some valid points, there were areas for improvement..."

Respond ONLY with valid JSON:
{"verdict":"1-2 sentence blunt verdict","improve":"1 sentence tip starting with a verb"}`;

  try {
    const vText = await claudeText(
      "You are a ranked competitive debate judge. Respond only with valid JSON. Be decisive and game-like.",
      prompt,
      300
    );

    const jMatch = vText.match(/\{[\s\S]*\}/);
    let judgeVerdict = {
      verdict:
        score >= 65
          ? "Clean win — you controlled the tempo and your opponent had no answer for your key points."
          : "Too much assertion, not enough substance. You got outgunned on every exchange that mattered.",
      improve: "Back every claim with a specific example or statistic before moving to the next point.",
    };
    if (jMatch) {
      try { judgeVerdict = JSON.parse(jMatch[0]); } catch { /* use default */ }
    }

    res.json({ ...judgeVerdict, rank, outcome });
  } catch (err) {
    req.log.error({ err }, "debate/verdict failed");
    res.status(500).json({ error: "AI error" });
  }
});

export default router;
