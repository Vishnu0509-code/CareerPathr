import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, careersTable, assessmentQuestionsTable, coursesTable, assessmentResultsTable, recommendationsTable, studentProfilesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.use((req, res, next) => {
  if (req.session.userRole !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
});

router.get("/admin/stats", async (req, res): Promise<void> => {
  const [studentCount] = await db
    .select({ count: count() })
    .from(usersTable)
    .where(eq(usersTable.role, "student"));

  const [careerCount] = await db.select({ count: count() }).from(careersTable);
  const [questionCount] = await db.select({ count: count() }).from(assessmentQuestionsTable);
  const [courseCount] = await db.select({ count: count() }).from(coursesTable);
  const [assessmentCount] = await db.select({ count: count() }).from(assessmentResultsTable);

  // Top careers by recommendation count
  const recs = await db.select().from(recommendationsTable);
  const careers = await db.select().from(careersTable);
  const careerCountMap: Record<number, number> = {};
  for (const rec of recs) {
    careerCountMap[rec.careerId] = (careerCountMap[rec.careerId] ?? 0) + 1;
  }
  const topCareersByInterest = Object.entries(careerCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([careerId, cnt]) => {
      const career = careers.find(c => c.id === parseInt(careerId));
      return { careerTitle: career?.title ?? "Unknown", count: cnt };
    });

  res.json({
    totalStudents: studentCount.count,
    totalCareers: careerCount.count,
    totalQuestions: questionCount.count,
    totalCourses: courseCount.count,
    assessmentsCompleted: assessmentCount.count,
    topCareersByInterest,
  });
});

router.get("/admin/users", async (req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  res.json(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  })));
});

router.put("/admin/users/:id/password", async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!Number.isInteger(userId) || userId < 1) { res.status(400).json({ error: "Invalid user ID" }); return; }
  if (password.length < 6) { res.status(400).json({ error: "Password must be at least 6 characters" }); return; }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, userId)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ success: true });
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId < 1) { res.status(400).json({ error: "Invalid user ID" }); return; }
  if (req.session.userId === userId) { res.status(400).json({ error: "You cannot delete your own admin account" }); return; }

  await db.delete(recommendationsTable).where(eq(recommendationsTable.userId, userId));
  await db.delete(assessmentResultsTable).where(eq(assessmentResultsTable.userId, userId));
  await db.delete(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));
  const [user] = await db.delete(usersTable).where(eq(usersTable.id, userId)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ success: true });
});

export default router;
