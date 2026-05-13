import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const customRivals = pgTable("custom_rivals", {
  id: serial("id").primaryKey(),
  shareCode: text("share_code").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull().default("🤖"),
  tone: text("tone").notNull().default("aggressive"),
  aggression: integer("aggression").notNull().default(5),
  logicLevel: integer("logic_level").notNull().default(5),
  humorLevel: integer("humor_level").notNull().default(5),
  difficulty: text("difficulty").notNull().default("medium"),
  memoryEnabled: boolean("memory_enabled").notNull().default(false),
  creatorDeviceId: text("creator_device_id"),
  playCount: integer("play_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CustomRival = typeof customRivals.$inferSelect;
