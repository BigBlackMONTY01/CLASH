import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

const BASELINE_DEBATES = 52;
const BASELINE_WINS = 30;
const BASELINE_TOPICS = 22;

export async function getPlatformStats(): Promise<{
  totalDebates: number;
  globalWinRate: number;
  uniqueTopics: number;
}> {
  try {
    const result = await db.execute(sql`
      SELECT
        COUNT(*)::int                                              AS total,
        COUNT(*) FILTER (WHERE badge = 'WIN')::int                AS wins,
        COUNT(DISTINCT topic) FILTER (WHERE topic IS NOT NULL)::int AS topics
      FROM activity_events
    `);
    const rows = (result as any).rows ?? result;
    const row = rows[0];
    const total  = BASELINE_DEBATES + Number(row?.total  ?? 0);
    const wins   = BASELINE_WINS    + Number(row?.wins   ?? 0);
    const topics = BASELINE_TOPICS  + Number(row?.topics ?? 0);
    return {
      totalDebates:  total,
      globalWinRate: total > 0 ? Math.round((wins / total) * 100) : 58,
      uniqueTopics:  topics,
    };
  } catch (err) {
    logger.error({ err }, "stats: query failed");
    return { totalDebates: 52, globalWinRate: 58, uniqueTopics: 22 };
  }
}
