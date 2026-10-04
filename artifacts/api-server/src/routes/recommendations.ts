import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, recommendationsTable, careersTable, studentProfilesTable } from "@workspace/db";
import { GetUserRecommendationsParams, GetSkillGapAnalysisParams } from "@workspace/api-zod";

const router = Router();

router.get("/recommendations/:userId", async (req, res): Promise<void> => {
  const paramsParsed = GetUserRecommendationsParams.safeParse({
    userId: parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId, 10),
  });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid userId" }); return; }

  const recs = await db
    .select()
    .from(recommendationsTable)
    .where(eq(recommendationsTable.userId, paramsParsed.data.userId))
    .orderBy(desc(recommendationsTable.matchScore));

  const result = [];
  for (const rec of recs) {
    const [career] = await db.select().from(careersTable).where(eq(careersTable.id, rec.careerId));
    if (!career) continue;
    result.push({
      id: rec.id,
      userId: rec.userId,
      careerId: rec.careerId,
      matchScore: rec.matchScore,
      career: {
        id: career.id,
        title: career.title,
        category: career.category,
        description: career.description,
        requiredSkills: career.requiredSkills,
        avgSalary: career.avgSalary,
        growthRate: career.growthRate,
        learningTimeMonths: career.learningTimeMonths,
      },
    });
  }

  res.json(result);
});

router.get("/recommendations/:userId/skill-gap", async (req, res): Promise<void> => {
  const paramsParsed = GetSkillGapAnalysisParams.safeParse({
    userId: parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId, 10),
  });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid userId" }); return; }

  const { userId } = paramsParsed.data;

  // Get user's profile skills
  const [profile] = await db
    .select()
    .from(studentProfilesTable)
    .where(eq(studentProfilesTable.userId, userId));

  const userSkills = profile?.skills ?? [];

  // Get optional careerId from query
  const careerId = req.query.careerId ? parseInt(req.query.careerId as string, 10) : undefined;

  let career;
  if (careerId && !isNaN(careerId)) {
    const [found] = await db.select().from(careersTable).where(eq(careersTable.id, careerId));
    career = found;
  } else {
    // Fall back to top recommendation
    const [topRec] = await db
      .select()
      .from(recommendationsTable)
      .where(eq(recommendationsTable.userId, userId))
      .orderBy(desc(recommendationsTable.matchScore))
      .limit(1);

    if (topRec) {
      const [found] = await db.select().from(careersTable).where(eq(careersTable.id, topRec.careerId));
      career = found;
    }
  }

  if (!career) {
    res.status(404).json({ error: "No career data found. Complete the assessment first." });
    return;
  }

  const requiredSkills = career.requiredSkills;
  const userSkillsLower = userSkills.map((s: string) => s.toLowerCase());
  const matchedSkills = requiredSkills.filter((s: string) => userSkillsLower.includes(s.toLowerCase()));
  const missingSkills = requiredSkills.filter((s: string) => !userSkillsLower.includes(s.toLowerCase()));
  const matchPercentage = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  res.json({
    careerId: career.id,
    careerTitle: career.title,
    requiredSkills,
    userSkills,
    missingSkills,
    matchedSkills,
    matchPercentage,
  });
});

export default router;
