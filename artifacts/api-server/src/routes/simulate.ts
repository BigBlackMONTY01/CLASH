import { Router } from "express";
import { SimulateBody } from "@workspace/api-zod";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const buildPrompt = (input: string) =>
  `You are a dramatic historian of civilizations that never existed.

The user described a civilization: "${input}"

Simulate 1000 years of history. Respond with ONLY a raw JSON object. No markdown, no backticks, no text before or after the JSON. Start your response with { and end with }.

{
  "name": "Epic civilization name (2-4 words)",
  "tagline": "Poetic one-liner describing their essence",
  "duration": "e.g. 847 years",
  "population_peak": "e.g. 2.3 million souls",
  "territory": "e.g. Three mountain ranges and the Amber Sea",
  "eras": [
    {
      "year": "Year 1 - 120",
      "type": "founding",
      "title": "Short era title",
      "body": "2-3 vivid cinematic sentences. Use *asterisks* around key names or terms."
    }
  ],
  "fate": "One haunting sentence about how they are remembered or forgotten."
}

Include 6-8 eras. Types allowed: founding, golden, conflict, discovery, catastrophe, renaissance, decline, end.
Include at least one golden era and one catastrophe. Be literary and dramatic.`;

router.post("/simulate", async (req, res) => {
  const parsed = SimulateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { description } = parsed.data;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: buildPrompt(description) }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      res.status(500).json({ error: "Unexpected response format from AI" });
      return;
    }

    const text = block.text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      res.status(500).json({ error: "Could not parse AI response as JSON" });
      return;
    }

    const simulation = JSON.parse(text.slice(start, end + 1));
    res.json(simulation);
  } catch (err) {
    req.log.error({ err }, "Simulation failed");
    res.status(500).json({ error: "Failed to generate simulation" });
  }
});

export default router;
