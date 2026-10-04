import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, careersTable, coursesTable } from "@workspace/db";
import {
  ListCareersQueryParams,
  CreateCareerBody,
  GetCareerParams,
  UpdateCareerParams,
  UpdateCareerBody,
  DeleteCareerParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/careers", async (req, res): Promise<void> => {
  const parsed = ListCareersQueryParams.safeParse(req.query);
  const category = parsed.success ? parsed.data.category : undefined;

  let careers;
  if (category) {
    careers = await db.select().from(careersTable).where(eq(careersTable.category, category));
  } else {
    careers = await db.select().from(careersTable);
  }
  res.json(careers.map(c => ({
    id: c.id, title: c.title, category: c.category, description: c.description,
    requiredSkills: c.requiredSkills, avgSalary: c.avgSalary, growthRate: c.growthRate,
    learningTimeMonths: c.learningTimeMonths,
  })));
});

router.post("/careers", async (req, res): Promise<void> => {
  const parsed = CreateCareerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [career] = await db.insert(careersTable).values(parsed.data).returning();
  res.status(201).json({
    id: career.id, title: career.title, category: career.category,
    description: career.description, requiredSkills: career.requiredSkills,
    avgSalary: career.avgSalary, growthRate: career.growthRate,
    learningTimeMonths: career.learningTimeMonths,
  });
});

router.get("/careers/:id", async (req, res): Promise<void> => {
  const paramsParsed = GetCareerParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10) });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [career] = await db.select().from(careersTable).where(eq(careersTable.id, paramsParsed.data.id));
  if (!career) { res.status(404).json({ error: "Career not found" }); return; }

  const courses = await db.select().from(coursesTable).where(eq(coursesTable.careerId, career.id));

  res.json({
    id: career.id, title: career.title, category: career.category,
    description: career.description, requiredSkills: career.requiredSkills,
    avgSalary: career.avgSalary, growthRate: career.growthRate,
    learningTimeMonths: career.learningTimeMonths, jobRoles: career.jobRoles,
    futureOpportunities: career.futureOpportunities,
    courses: courses.map(c => ({
      id: c.id, careerId: c.careerId, title: c.title, provider: c.provider,
      url: c.url, type: c.type, duration: c.duration, level: c.level,
    })),
  });
});

router.put("/careers/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateCareerParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10) });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const bodyParsed = UpdateCareerBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  const [career] = await db
    .update(careersTable)
    .set(bodyParsed.data)
    .where(eq(careersTable.id, paramsParsed.data.id))
    .returning();
  if (!career) { res.status(404).json({ error: "Career not found" }); return; }

  res.json({
    id: career.id, title: career.title, category: career.category,
    description: career.description, requiredSkills: career.requiredSkills,
    avgSalary: career.avgSalary, growthRate: career.growthRate,
    learningTimeMonths: career.learningTimeMonths,
  });
});

router.delete("/careers/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteCareerParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10) });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db
    .delete(careersTable)
    .where(eq(careersTable.id, paramsParsed.data.id))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Career not found" }); return; }

  res.json({ success: true, message: "Career deleted" });
});

export default router;
