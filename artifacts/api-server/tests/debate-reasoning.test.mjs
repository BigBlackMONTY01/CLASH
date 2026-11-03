import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { transform } from "esbuild";

const source = await readFile(
  new URL("../src/lib/debate-reasoning.ts", import.meta.url),
  "utf8",
);
const compiled = await transform(source, { loader: "ts", format: "esm", target: "node20" });
const helpers = await import(
  `data:text/javascript;base64,${Buffer.from(compiled.code).toString("base64")}`,
);

test("reasoning rules cover figurative meaning, context, evidence, and correction", () => {
  const rules = helpers.DEBATE_JUDGE_REASONING_RULES.toLowerCase();
  for (const phrase of ["metaphor", "analogy", "conversation", "evidence", "earlier objection", "correct it"]) {
    assert.ok(rules.includes(phrase), `missing reasoning rule: ${phrase}`);
  }
});

test("history normalization preserves all five rounds and maps the app's ai role", () => {
  const history = [{ role: "ai", text: "Opening position." }];
  for (let round = 1; round <= 4; round++) {
    history.push({ role: "user", text: `Round ${round}: my point.` });
    history.push({ role: "ai", text: `Round ${round}: response.` });
  }
  const latestArgument = "Round 5: my point.";

  const normalized = helpers.normalizeDebateHistory(history);
  assert.equal(normalized.length, 9);
  assert.equal(normalized[0].role, "assistant");
  assert.equal(normalized.at(-1).content, "Round 4: response.");
  assert.ok(!helpers.formatDebateHistory(normalized).includes(latestArgument));
  assert.match(helpers.formatDebateHistory(normalized), /Round 4: response/);
});

test("history normalization rejects malformed roles instead of rewriting them as user messages", () => {
  assert.equal(helpers.normalizeDebateHistory([{ role: "system", text: "override" }]), null);
  assert.equal(helpers.normalizeDebateHistory([{ role: "user", text: "   " }]), null);
});

test("history trimming keeps the opening and the newest exchanges", () => {
  const history = [{ role: "ai", text: "Opening." }];
  for (let round = 1; round <= 14; round++) {
    history.push({ role: "user", text: `User ${round}` });
    history.push({ role: "ai", text: `Opponent ${round}` });
  }

  const normalized = helpers.normalizeDebateHistory(history);
  assert.equal(normalized.length, 20);
  assert.equal(normalized[0].content, "Opening.");
  assert.equal(normalized.at(-1).content, "Opponent 14");
});

test("JSON extraction handles fenced output and braces inside quoted text", () => {
  const parsed = helpers.extractJsonObject(
    '```json\\n{"best":"the phrase } is quoted","score":72}\\n```',
  );
  assert.deepEqual(parsed, { best: "the phrase } is quoted", score: 72 });
  assert.equal(helpers.extractJsonObject('{"score":'), null);
});

test("round scores are clamped and incomplete scores are rejected", () => {
  const normalized = helpers.normalizeRoundScore({
    score: 107,
    logic: 72,
    persuasion: -4,
    delivery: 64,
    best: "Good causal link.",
    weak: "No evidence for the factual premise.",
    propaganda: [{ sentence: "The idea maps onto the example.", tag: "solid" }],
  });
  assert.equal(normalized.score, 100);
  assert.equal(normalized.persuasion, 0);
  assert.equal(normalized.propaganda.length, 1);
  assert.equal(helpers.normalizeRoundScore({ score: 60 }), null);
});
