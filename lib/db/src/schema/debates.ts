import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { players } from "./players";

export const debates = pgTable("debates", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  opponentId: text("opponent_id").notNull(),
  opponentName: text("opponent_name").notNull(),
  topic: text("topic").notNull(),
  topicCat: text("topic_cat").notNull().default("General"),
  side: text("side").notNull(),
  rounds: integer("rounds").notNull(),
  avgScore: integer("avg_score").notNull(),
  avgLogic: integer("avg_logic").notNull(),
  avgPersuasion: integer("avg_persuasion").notNull(),
  avgDelivery: integer("avg_delivery").notNull(),
  rank: text("rank").notNull(),
  won: boolean("won").notNull(),
  isGauntlet: boolean("is_gauntlet").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertDebateSchema = createInsertSchema(debates).omit({ id: true, createdAt: true });
export type Debate = typeof debates.$inferSelect;
export type InsertDebate = z.infer<typeof insertDebateSchema>;
