import { Router } from "express";

const router = Router();

const store: Array<{ category: string; text: string; ts: string; ua: string }> = [];

router.post("/feedback", (req, res) => {
  const { category, text } = req.body as { category: string; text: string };
  if (!text || typeof text !== "string" || text.trim().length < 3) {
    res.status(400).json({ error: "feedback text required" });
    return;
  }
  store.push({
    category: typeof category === "string" ? category : "general",
    text: text.trim().slice(0, 1000),
    ts: new Date().toISOString(),
    ua: req.headers["user-agent"] || "",
  });
  if (store.length > 500) store.splice(0, store.length - 500);
  res.json({ ok: true });
});

router.get("/feedback", (_req, res) => {
  res.json(store.slice(-100).reverse());
});

export default router;
