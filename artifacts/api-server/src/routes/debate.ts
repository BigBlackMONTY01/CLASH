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

// POST /api/debate/start — AI opens the debate
router.post("/debate/start", async (req, res) => {
  const { personality, topic, userSide, oppSide, totalRounds } = req.body as Record<string, unknown>;
  if (!str(personality) || !str(topic) || !str(userSide) || !str(oppSide) || !num(totalRounds)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const system = `${personality as string}

You are debating the topic: "${topic as string}"
You are arguing ${oppSide as string} this statement. The user is arguing ${userSide as string}.
This is round 1 of ${totalRounds as number}. Open the debate with your opening argument. Be sharp, confident, and start the clash immediately. Keep it to 3-4 sentences. Do NOT say "Round 1" or any meta commentary. Just argue.`;

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
  const { personality, topic, userSide, oppSide, messages, userArgument, round, totalRounds, isLastRound } =
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
    const scorePrompt = `You are an impartial debate judge. Score the user's argument on a scale of 0-100.

Topic: "${topic as string}"
User is arguing: ${userSide as string}
Round: ${round as number} of ${totalRounds as number}

User's argument: "${userArgument as string}"

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

    const systemResp = (isLastRound as boolean)
      ? `${personality as string}

Topic: "${topic as string}" — You argue ${oppSide as string}, user argues ${userSide as string}.
This is the FINAL ROUND. Give a powerful closing argument that wraps up your position. 3-4 sentences maximum. Be decisive.`
      : `${personality as string}

Topic: "${topic as string}" — You argue ${oppSide as string}, user argues ${userSide as string}.
Round ${(round as number) + 1} of ${totalRounds as number}. Respond directly to the user's last argument. Counter it sharply. 3-4 sentences.`;

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
  const { topic, avgScore, avgLogic, avgPersuasion, avgDelivery } = req.body as Record<string, unknown>;
  if (!str(topic) || !num(avgScore) || !num(avgLogic) || !num(avgPersuasion) || !num(avgDelivery)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const prompt = `You are a final debate judge. The debate on "${topic as string}" has ended.

User's average score: ${avgScore as number}/100.
Write a 2-sentence judge's verdict. Be honest but constructive. If score >= 65, acknowledge their win but note weaknesses. If score < 65, acknowledge effort but explain why they lost. Be specific to the topic.
Respond ONLY with JSON: {"verdict":"2 sentence verdict","improve":"One specific technique they should practice"}`;

  try {
    const vText = await claudeText("You are a strict debate judge. Respond only with JSON.", prompt);
    const jMatch = vText.match(/\{[\s\S]*\}/);
    let judgeVerdict = {
      verdict:
        (avgScore as number) >= 65
          ? "A solid performance with well-structured arguments."
          : "A valiant effort, but key arguments needed stronger evidence.",
      improve: "Practice backing claims with specific examples.",
    };
    if (jMatch) {
      try { judgeVerdict = JSON.parse(jMatch[0]); } catch { /* use default */ }
    }
    res.json(judgeVerdict);
  } catch (err) {
    req.log.error({ err }, "debate/verdict failed");
    res.status(500).json({ error: "AI error" });
  }
});

export default router;
