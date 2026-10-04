import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  careerId: integer("career_id").notNull(),
  title: text("title").notNull(),
  provider: text("provider").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull().default("course"), // course | certification | roadmap
  duration: text("duration").notNull(),
  level: text("level").notNull().default("beginner"), // beginner | intermediate | advanced
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
