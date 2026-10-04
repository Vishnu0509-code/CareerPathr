import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, studentProfilesTable } from "@workspace/db";
import { UpdateStudentProfileBody, UpdateStudentProfileParams } from "@workspace/api-zod";

const router = Router();

router.get("/students/:userId/profile", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({
    id: profile.id,
    userId: profile.userId,
    yearOfStudy: profile.yearOfStudy,
    major: profile.major,
    skills: profile.skills,
    interests: profile.interests,
    updatedAt: profile.updatedAt,
  });
});

router.put("/students/:userId/profile", async (req, res): Promise<void> => {
  const paramsParsed = UpdateStudentProfileParams.safeParse(req.params);
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid userId" }); return; }

  const bodyParsed = UpdateStudentProfileBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  const { userId } = paramsParsed.data;
  const { yearOfStudy, major, skills, interests } = bodyParsed.data;

  const [existing] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));
  let profile;
  if (existing) {
    [profile] = await db
      .update(studentProfilesTable)
      .set({ yearOfStudy, major, skills, interests, updatedAt: new Date() })
      .where(eq(studentProfilesTable.userId, userId))
      .returning();
  } else {
    [profile] = await db
      .insert(studentProfilesTable)
      .values({ userId, yearOfStudy, major, skills, interests })
      .returning();
  }

  res.json({
    id: profile.id,
    userId: profile.userId,
    yearOfStudy: profile.yearOfStudy,
    major: profile.major,
    skills: profile.skills,
    interests: profile.interests,
    updatedAt: profile.updatedAt,
  });
});

export default router;
