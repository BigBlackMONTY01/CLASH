import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { startCleanupJob } from "./lib/cleanup";

const app: Express = express();
app.set("trust proxy", 1);

app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
}));

const ALLOWED_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$|\.replit\.(app|dev)$|\.onrender\.com$|\.netlify\.app$|\.vercel\.app$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin || process.env.NODE_ENV === "development" || ALLOWED_ORIGIN.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, max: 200,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 30,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "AI rate limit reached. Please wait a few minutes." },
});

app.use("/api", generalLimiter);
app.use("/api/debate", aiLimiter);
app.use("/api", router);

// Serve Clash frontend static files in production only if the dist folder exists.
// When the frontend is deployed separately (e.g. Vercel), this folder won't be present
// and we skip static serving so API routes are never shadowed by the catch-all.
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist = process.env.FRONTEND_DIST
    ? path.resolve(process.cwd(), process.env.FRONTEND_DIST)
    : path.resolve(__dirname, "../../clash/dist/public");

  import("fs").then(({ existsSync }) => {
    if (existsSync(frontendDist)) {
      app.use(express.static(frontendDist));
      app.get(/^(?!\/api).*/, (_req, res) => {
        res.sendFile(path.join(frontendDist, "index.html"));
      });
    }
  });
}

startCleanupJob();

export default app;
