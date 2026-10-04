import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assessmentQuestionsTable = pgTable("assessment_questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: text("category").notNull(),
  options: jsonb("options").notNull().$type<Array<{ value: string; label: string; careerTags: string[] }>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAssessmentQuestionSchema = createInsertSchema(assessmentQuestionsTable).omit({ id: true, createdAt: true });
export type InsertAssessmentQuestion = z.infer<typeof insertAssessmentQuestionSchema>;
export type AssessmentQuestion = typeof assessmentQuestionsTable.$inferSelect;
