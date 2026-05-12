import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, users, players } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
export const JWT_SECRET = process.env.JWT_SECRET || "clash-dev-secret-change-in-production";

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const { email, password, deviceId } = req.body as Record<string, unknown>;
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  if ((password as string).length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }
  const emailLower = (email as string).toLowerCase().trim();
  try {
    const existing = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }
    const passwordHash = await bcrypt.hash(password as string, 12);
    let playerId: number | null = null;
    if (deviceId && typeof deviceId === "string") {
      const existingPlayer = await db.select().from(players).where(eq(players.deviceId, deviceId)).limit(1);
      if (existingPlayer.length > 0) playerId = existingPlayer[0].id;
    }
    if (!playerId) {
      const newPlayer = await db.insert(players).values({ deviceId: (deviceId as string) || `email_${Date.now()}` }).returning();
      playerId = newPlayer[0].id;
    }
    const user = await db.insert(users).values({ email: emailLower, passwordHash, playerId }).returning();
    const token = jwt.sign({ userId: user[0].id, playerId, email: emailLower }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, userId: user[0].id, playerId, email: emailLower });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }
    req.log.error({ err }, "auth/register failed");
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as Record<string, unknown>;
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const emailLower = (email as string).toLowerCase().trim();
  try {
    const user = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    if (user.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const valid = await bcrypt.compare(password as string, user[0].passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = jwt.sign({ userId: user[0].id, playerId: user[0].playerId, email: emailLower }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, userId: user[0].id, playerId: user[0].playerId, email: emailLower });
  } catch (err) {
    req.log.error({ err }, "auth/login failed");
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// GET /api/auth/me
router.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token" });
    return;
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: number; playerId: number; email: string };
    res.json({ userId: payload.userId, playerId: payload.playerId, email: payload.email });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
