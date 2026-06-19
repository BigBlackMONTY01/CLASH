import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const platformStats = pgTable("platform_stats", {
  id: serial("id").primaryKey(),
  totalDebates: integer("total_debates").notNull().default(0),
  totalWins: integer("total_wins").notNull().default(0),
  totalTopics: integer("total_topics").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type PlatformStats = typeof platformStats.$inferSelect;
