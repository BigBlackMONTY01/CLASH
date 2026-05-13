import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { players } from "./players";
import { debates } from "./debates";

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  debateId: integer("debate_id").references(() => debates.id),
  opponentId: text("opponent_id").notNull(),
  opponentName: text("opponent_name").notNull(),
  topic: text("topic").notNull(),
  score: integer("score").notNull(),
  rank: text("rank").notNull(),
  rarity: text("rarity").notNull().default("Common"),
  bestQuote: text("best_quote").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
