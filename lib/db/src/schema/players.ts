import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  username: text("username").unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  avatarId: text("avatar_id").notNull().default(""),
  accentColor: text("accent_color").notNull().default("#e63946"),
  cardBg: text("card_bg").notNull().default("bg0"),
  soundPack: text("sound_pack").notNull().default("classic"),
  isGuest: boolean("is_guest").notNull().default(true),
  userId: text("user_id"),
  lastSeen: timestamp("last_seen", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, createdAt: true, updatedAt: true });
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
