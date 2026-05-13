import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { players } from "./players";

export const aiPersonas = pgTable("ai_personas", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  name: text("name").notNull(),
  avatar: text("avatar").notNull().default("🤖"),
  tone: text("tone").notNull().default("aggressive"),
  aggression: integer("aggression").notNull().default(5),
  logicLevel: integer("logic_level").notNull().default(5),
  humorLevel: integer("humor_level").notNull().default(3),
  difficulty: text("difficulty").notNull().default("medium"),
  memoryEnabled: boolean("memory_enabled").notNull().default(false),
  shareCode: text("share_code").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiMemory = pgTable("ai_memory", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").notNull().references(() => aiPersonas.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  patternSummary: text("pattern_summary").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AiPersona = typeof aiPersonas.$inferSelect;
export type AiMemory = typeof aiMemory.$inferSelect;
