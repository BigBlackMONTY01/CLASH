import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { players } from "./players";

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const rankings = pgTable("rankings", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  seasonId: integer("season_id").references(() => seasons.id),
  mmr: integer("mmr").notNull().default(1000),
  rank: text("rank").notNull().default("Bronze"),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  peakMmr: integer("peak_mmr").notNull().default(1000),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Season = typeof seasons.$inferSelect;
export type Ranking = typeof rankings.$inferSelect;
