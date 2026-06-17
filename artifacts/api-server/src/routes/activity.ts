import { Router } from "express";

const router = Router();

// GET /api/activity/recent — returns empty list (frontend uses fake feed)
router.get("/activity/recent", (_req, res) => {
  res.json([]);
});

// GET /api/stats/global — returns baseline stats; frontend animates from this
router.get("/stats/global", (_req, res) => {
  res.json({
    totalDebates: 0,
    globalWinRate: 0,
    uniqueTopics: 0,
    activePlayers: 0,
  });
});

export default router;
