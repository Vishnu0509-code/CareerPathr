import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, careersTable, coursesTable } from "@workspace/db";
import {
  ListCoursesQueryParams,
  CreateCourseBody,
  UpdateCourseParams,
  UpdateCourseBody,
  DeleteCourseParams,
} from "@workspace/api-zod";

const router = Router();

const starterResources: Record<string, Array<{
  title: string; provider: string; url: string; type: string; duration: string; level: string;
}>> = {
  "Software Development": [
    { title: "MDN Learn Web Development", provider: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development", type: "course", duration: "6–8 weeks", level: "beginner" },
    { title: "Build Your Developer Portfolio", provider: "CareerPathr", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website", type: "roadmap", duration: "2 weeks", level: "beginner" },
  ],
  Cybersecurity: [
    { title: "OWASP Top 10", provider: "OWASP", url: "https://owasp.org/www-project-top-ten/", type: "course", duration: "2–3 weeks", level: "beginner" },
    { title: "Cybersecurity Foundations Roadmap", provider: "CareerPathr", url: "https://www.cisa.gov/topics/cybersecurity-best-practices", type: "roadmap", duration: "8 weeks", level: "beginner" },
  ],
  "Data Science": [
    { title: "Kaggle Learn", provider: "Kaggle", url: "https://www.kaggle.com/learn", type: "course", duration: "4–6 weeks", level: "beginner" },
    { title: "Python Data Analysis Roadmap", provider: "CareerPathr", url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html", type: "roadmap", duration: "8 weeks", level: "beginner" },
  ],
  "Artificial Intelligence": [
    { title: "Machine Learning Crash Course", provider: "Google", url: "https://developers.google.com/machine-learning/crash-course", type: "course", duration: "6 weeks", level: "beginner" },
    { title: "AI Fundamentals Roadmap", provider: "CareerPathr", url: "https://developers.google.com/machine-learning", type: "roadmap", duration: "10 weeks", level: "intermediate" },
  ],
  "Cloud Computing": [
    { title: "AWS Skill Builder", provider: "AWS", url: "https://skillbuilder.aws/", type: "course", duration: "4–6 weeks", level: "beginner" },
    { title: "Cloud Foundations Roadmap", provider: "CareerPathr", url: "https://aws.amazon.com/training/learn-about/cloud-practitioner/", type: "roadmap", duration: "8 weeks", level: "beginner" },
  ],
  "UI/UX Design": [
    { title: "Figma Resource Library", provider: "Figma", url: "https://www.figma.com/resource-library/", type: "course", duration: "4 weeks", level: "beginner" },
    { title: "Design Process Roadmap", provider: "CareerPathr", url: "https://www.nngroup.com/articles/ux-basics-study-guide/", type: "roadmap", duration: "8 weeks", level: "beginner" },
  ],
  Entrepreneurship: [
    { title: "Startup School", provider: "Y Combinator", url: "https://www.startupschool.org/", type: "course", duration: "6 weeks", level: "beginner" },
    { title: "Validate Your Product Idea", provider: "CareerPathr", url: "https://www.ycombinator.com/library/4A-how-to-talk-to-users", type: "roadmap", duration: "4 weeks", level: "beginner" },
  ],
};

async function ensureStarterCourses() {
  const existingCourses = await db.select().from(coursesTable);
  if (existingCourses.length > 0) return;

  const careers = await db.select().from(careersTable);
  const resources = careers.flatMap((career) =>
    (starterResources[career.category] ?? []).map((resource) => ({
      ...resource,
      careerId: career.id,
    })),
  );

  if (resources.length > 0) await db.insert(coursesTable).values(resources);
}

router.get("/courses", async (req, res): Promise<void> => {
  await ensureStarterCourses();
  const parsed = ListCoursesQueryParams.safeParse(req.query);
  const careerId = parsed.success ? parsed.data.careerId : undefined;

  let courses;
  if (careerId) {
    courses = await db.select().from(coursesTable).where(eq(coursesTable.careerId, careerId));
  } else {
    courses = await db.select().from(coursesTable);
  }
  res.json(courses.map(c => ({
    id: c.id, careerId: c.careerId, title: c.title, provider: c.provider,
    url: c.url, type: c.type, duration: c.duration, level: c.level,
  })));
});

router.post("/courses", async (req, res): Promise<void> => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [course] = await db.insert(coursesTable).values(parsed.data).returning();
  res.status(201).json({
    id: course.id, careerId: course.careerId, title: course.title,
    provider: course.provider, url: course.url, type: course.type,
    duration: course.duration, level: course.level,
  });
});

router.put("/courses/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateCourseParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10) });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const bodyParsed = UpdateCourseBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  const [course] = await db
    .update(coursesTable)
    .set(bodyParsed.data)
    .where(eq(coursesTable.id, paramsParsed.data.id))
    .returning();
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }

  res.json({
    id: course.id, careerId: course.careerId, title: course.title,
    provider: course.provider, url: course.url, type: course.type,
    duration: course.duration, level: course.level,
  });
});

router.delete("/courses/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteCourseParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10) });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db
    .delete(coursesTable)
    .where(eq(coursesTable.id, paramsParsed.data.id))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Course not found" }); return; }

  res.json({ success: true, message: "Course deleted" });
});

export default router;
