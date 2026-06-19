import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const activityEvents = pgTable("activity_events", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  badge: text("badge").notNull(),
  icon: text("icon").notNull().default("skull"),
  topic: text("topic"),
  isFake: boolean("is_fake").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ActivityEvent = typeof activityEvents.$inferSelect;
export type InsertActivityEvent = typeof activityEvents.$inferInsert;
