import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const roomArguments = pgTable("room_arguments", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => rooms.id),
  roundNum: integer("round_num").notNull(),
  playerNum: integer("player_num").notNull(),
  argumentText: text("argument_text").notNull(),
  score: integer("score"),
  logic: integer("logic"),
  persuasion: integer("persuasion"),
  delivery: integer("delivery"),
  rank: text("rank"),
  critique: text("critique"),
  highlights: text("highlights"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type RoomArgument = typeof roomArguments.$inferSelect;
