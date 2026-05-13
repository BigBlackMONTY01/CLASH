import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { players } from "./players";

export const shieldTokens = pgTable("shield_tokens", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id).unique(),
  count: integer("count").notNull().default(0),
  lastGrantedAt: timestamp("last_granted_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const signatureTitles = pgTable("signature_titles", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id).unique(),
  title: text("title").notNull(),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dynasty = pgTable("dynasty", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  opponentId: text("opponent_id").notNull(),
  opponentName: text("opponent_name").notNull(),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ShieldToken = typeof shieldTokens.$inferSelect;
export type SignatureTitle = typeof signatureTitles.$inferSelect;
export type Dynasty = typeof dynasty.$inferSelect;
