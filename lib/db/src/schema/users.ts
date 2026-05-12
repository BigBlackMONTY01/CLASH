import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { players } from "./players";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  playerId: integer("player_id").references(() => players.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
