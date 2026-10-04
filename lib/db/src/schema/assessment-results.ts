import { pgTable, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { text } from "drizzle-orm/pg-core";

export const assessmentResultsTable = pgTable("assessment_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  answers: jsonb("answers").notNull().$type<Array<{ questionId: number; selectedValue: string }>>(),
  topCareerTags: text("top_career_tags").array().notNull().default([]),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAssessmentResultSchema = createInsertSchema(assessmentResultsTable).omit({ id: true });
export type InsertAssessmentResult = z.infer<typeof insertAssessmentResultSchema>;
export type AssessmentResult = typeof assessmentResultsTable.$inferSelect;
