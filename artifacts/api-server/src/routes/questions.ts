import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, assessmentQuestionsTable } from "@workspace/db";
import {
  CreateQuestionBody,
  UpdateQuestionParams,
  UpdateQuestionBody,
  DeleteQuestionParams,
} from "@workspace/api-zod";

const router = Router();

const formatQuestion = (q: typeof assessmentQuestionsTable.$inferSelect) => ({
  id: q.id,
  text: q.text,
  category: q.category,
  options: q.options,
});

router.get("/questions", async (req, res): Promise<void> => {
  const questions = await db.select().from(assessmentQuestionsTable);
  res.json(questions.map(formatQuestion));
});

router.post("/questions", async (req, res): Promise<void> => {
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [question] = await db.insert(assessmentQuestionsTable).values({
    text: parsed.data.text,
    category: parsed.data.category,
    options: parsed.data.options,
  }).returning();
  res.status(201).json(formatQuestion(question));
});

router.put("/questions/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateQuestionParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10) });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const bodyParsed = UpdateQuestionBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  const [question] = await db
    .update(assessmentQuestionsTable)
    .set({
      text: bodyParsed.data.text,
      category: bodyParsed.data.category,
      options: bodyParsed.data.options,
    })
    .where(eq(assessmentQuestionsTable.id, paramsParsed.data.id))
    .returning();
  if (!question) { res.status(404).json({ error: "Question not found" }); return; }

  res.json(formatQuestion(question));
});

router.delete("/questions/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteQuestionParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10) });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db
    .delete(assessmentQuestionsTable)
    .where(eq(assessmentQuestionsTable.id, paramsParsed.data.id))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Question not found" }); return; }

  res.json({ success: true, message: "Question deleted" });
});

export default router;
