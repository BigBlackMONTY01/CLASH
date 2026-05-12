import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { players } from "./players";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  topicText: text("topic_text").notNull(),
  topicCat: text("topic_cat").notNull().default("General"),
  player1Id: integer("player1_id").notNull().references(() => players.id),
  player2Id: integer("player2_id").references(() => players.id),
  player1Side: text("player1_side"),
  player2Side: text("player2_side"),
  player1Ready: boolean("player1_ready").notNull().default(false),
  player2Ready: boolean("player2_ready").notNull().default(false),
  status: text("status").notNull().default("waiting"),
  totalRounds: integer("total_rounds").notNull().default(3),
  currentRound: integer("current_round").notNull().default(1),
  winnerPlayerNum: integer("winner_player_num"),
  player1Score: integer("player1_score"),
  player2Score: integer("player2_score"),
  player1Rank: text("player1_rank"),
  player2Rank: text("player2_rank"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export type Room = typeof rooms.$inferSelect;
