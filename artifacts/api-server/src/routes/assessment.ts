import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, assessmentQuestionsTable, assessmentResultsTable, recommendationsTable, careersTable } from "@workspace/db";
import { SubmitAssessmentBody, GetAssessmentResultsParams } from "@workspace/api-zod";

const router = Router();

// A new installation has no admin-created questions yet. Seed a complete,
// usable assessment on first access so students never see an empty quiz.
const starterQuestions = [
  { text: "Which activity sounds most enjoyable to you?", category: "interests", options: [
    { value: "build", label: "Building an app or website", careerTags: ["Software Development", "Cloud Computing"] },
    { value: "analyze", label: "Finding patterns in data", careerTags: ["Data Science", "Artificial Intelligence"] },
    { value: "create", label: "Designing an engaging experience", careerTags: ["UI/UX Design", "Entrepreneurship"] },
  ] },
  { text: "When solving a difficult problem, you usually…", category: "problem-solving", options: [
    { value: "logic", label: "Break it into logical steps", careerTags: ["Software Development", "Cybersecurity"] },
    { value: "research", label: "Research data and test ideas", careerTags: ["Data Science", "Artificial Intelligence"] },
    { value: "people", label: "Ask people and explore their needs", careerTags: ["UI/UX Design", "Entrepreneurship"] },
  ] },
  { text: "Which outcome would make you most proud?", category: "motivation", options: [
    { value: "secure", label: "Keeping people and systems safe", careerTags: ["Cybersecurity", "Cloud Computing"] },
    { value: "smart", label: "Creating a system that learns", careerTags: ["Artificial Intelligence", "Data Science"] },
    { value: "business", label: "Launching a useful new product", careerTags: ["Entrepreneurship", "UI/UX Design"] },
  ] },
  { text: "Which school subject do you enjoy most?", category: "strengths", options: [
    { value: "math", label: "Mathematics and statistics", careerTags: ["Data Science", "Artificial Intelligence"] },
    { value: "computers", label: "Computer science", careerTags: ["Software Development", "Cybersecurity"] },
    { value: "art", label: "Art, design, or communication", careerTags: ["UI/UX Design", "Entrepreneurship"] },
  ] },
  { text: "What type of work environment appeals to you?", category: "work-style", options: [
    { value: "team", label: "A collaborative product team", careerTags: ["Software Development", "UI/UX Design"] },
    { value: "focus", label: "Deep technical investigation", careerTags: ["Cybersecurity", "Data Science"] },
    { value: "fast", label: "A fast-moving startup", careerTags: ["Entrepreneurship", "Cloud Computing"] },
  ] },
  { text: "Which challenge would you choose first?", category: "interests", options: [
    { value: "bug", label: "Fixing a complex software bug", careerTags: ["Software Development", "Cybersecurity"] },
    { value: "model", label: "Teaching a computer to recognize images", careerTags: ["Artificial Intelligence", "Data Science"] },
    { value: "journey", label: "Improving a customer's app journey", careerTags: ["UI/UX Design", "Entrepreneurship"] },
  ] },
  { text: "How do you prefer to make decisions?", category: "decision-making", options: [
    { value: "evidence", label: "Use evidence and measurements", careerTags: ["Data Science", "Cloud Computing"] },
    { value: "risk", label: "Assess risks and protect against them", careerTags: ["Cybersecurity", "Software Development"] },
    { value: "vision", label: "Follow a bold product vision", careerTags: ["Entrepreneurship", "UI/UX Design"] },
  ] },
  { text: "Which tool would you be most excited to learn?", category: "learning", options: [
    { value: "code", label: "A programming language", careerTags: ["Software Development", "Cloud Computing"] },
    { value: "ml", label: "Machine-learning tools", careerTags: ["Artificial Intelligence", "Data Science"] },
    { value: "design", label: "A design and prototyping tool", careerTags: ["UI/UX Design", "Entrepreneurship"] },
  ] },
  { text: "What matters most in a project?", category: "values", options: [
    { value: "reliable", label: "It is reliable and scalable", careerTags: ["Cloud Computing", "Software Development"] },
    { value: "safe", label: "It protects user privacy", careerTags: ["Cybersecurity", "Data Science"] },
    { value: "useful", label: "It solves a real human problem", careerTags: ["UI/UX Design", "Entrepreneurship"] },
  ] },
  { text: "Which future role sounds most like you?", category: "career-goals", options: [
    { value: "engineer", label: "Engineer building digital products", careerTags: ["Software Development", "Cloud Computing"] },
    { value: "scientist", label: "Analyst or AI specialist", careerTags: ["Data Science", "Artificial Intelligence"] },
    { value: "founder", label: "Designer or startup founder", careerTags: ["UI/UX Design", "Entrepreneurship"] },
  ] },
];

const starterCareers = [
  { title: "Software Developer", category: "Software Development", description: "Build reliable web, mobile, and backend applications.", requiredSkills: ["JavaScript", "TypeScript", "Git", "Problem Solving"], avgSalary: "$85,000", growthRate: "High", learningTimeMonths: 8, jobRoles: ["Frontend Developer", "Backend Developer", "Full-Stack Developer"], futureOpportunities: "Build products across every industry." },
  { title: "Cybersecurity Analyst", category: "Cybersecurity", description: "Protect systems, networks, and data from digital threats.", requiredSkills: ["Networking", "Linux", "Security Fundamentals", "Risk Analysis"], avgSalary: "$92,000", growthRate: "Very High", learningTimeMonths: 9, jobRoles: ["Security Analyst", "Penetration Tester", "Security Engineer"], futureOpportunities: "Security expertise is essential in every connected organization." },
  { title: "Data Scientist", category: "Data Science", description: "Turn data into insights that guide better decisions.", requiredSkills: ["Python", "SQL", "Statistics", "Data Visualization"], avgSalary: "$100,000", growthRate: "High", learningTimeMonths: 10, jobRoles: ["Data Analyst", "Data Scientist", "Analytics Engineer"], futureOpportunities: "Use data to solve business and social problems." },
  { title: "AI Engineer", category: "Artificial Intelligence", description: "Design and deploy intelligent systems using machine learning.", requiredSkills: ["Python", "Machine Learning", "Mathematics", "Data Engineering"], avgSalary: "$115,000", growthRate: "Very High", learningTimeMonths: 12, jobRoles: ["Machine Learning Engineer", "AI Engineer", "Applied Scientist"], futureOpportunities: "Create the next generation of intelligent products." },
  { title: "Cloud Engineer", category: "Cloud Computing", description: "Build scalable and dependable cloud infrastructure.", requiredSkills: ["Linux", "Networking", "AWS", "DevOps"], avgSalary: "$105,000", growthRate: "High", learningTimeMonths: 9, jobRoles: ["Cloud Engineer", "DevOps Engineer", "Site Reliability Engineer"], futureOpportunities: "Support the infrastructure behind modern digital services." },
  { title: "UI/UX Designer", category: "UI/UX Design", description: "Create clear, accessible, and delightful digital experiences.", requiredSkills: ["User Research", "Figma", "Prototyping", "Visual Design"], avgSalary: "$80,000", growthRate: "High", learningTimeMonths: 7, jobRoles: ["UX Designer", "Product Designer", "UI Designer"], futureOpportunities: "Shape how people interact with technology." },
  { title: "Product Entrepreneur", category: "Entrepreneurship", description: "Identify opportunities and turn ideas into valuable products.", requiredSkills: ["Product Strategy", "Communication", "Market Research", "Leadership"], avgSalary: "$75,000+", growthRate: "High", learningTimeMonths: 6, jobRoles: ["Founder", "Product Manager", "Business Development Associate"], futureOpportunities: "Launch and grow ventures that solve real problems." },
];

async function getOrCreateAssessmentQuestions() {
  const questions = await db.select().from(assessmentQuestionsTable);
  if (questions.length > 0) return questions;
  return db.insert(assessmentQuestionsTable).values(starterQuestions).returning();
}

async function getOrCreateCareers() {
  const careers = await db.select().from(careersTable);
  if (careers.length > 0) return careers;
  return db.insert(careersTable).values(starterCareers).returning();
}

router.get("/assessment/questions", async (req, res): Promise<void> => {
  const questions = await getOrCreateAssessmentQuestions();
  res.json(questions.map(q => ({
    id: q.id,
    text: q.text,
    category: q.category,
    options: q.options,
  })));
});

router.post("/assessment/submit", async (req, res): Promise<void> => {
  const parsed = SubmitAssessmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { userId, answers } = parsed.data;

  // Tally career tags from selected answers
  const questions = await getOrCreateAssessmentQuestions();
  const tagCounts: Record<string, number> = {};

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) continue;
    const option = (question.options as Array<{ value: string; label: string; careerTags: string[] }>)
      .find(o => o.value === answer.selectedValue);
    if (!option) continue;
    for (const tag of option.careerTags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  // Sort tags by count
  const topCareerTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  // Save result (delete old ones for this user first)
  await db.delete(assessmentResultsTable).where(eq(assessmentResultsTable.userId, userId));
  const [result] = await db
    .insert(assessmentResultsTable)
    .values({ userId, answers, topCareerTags, completedAt: new Date() })
    .returning();

  // Generate recommendations based on career tags
  const allCareers = await getOrCreateCareers();
  await db.delete(recommendationsTable).where(eq(recommendationsTable.userId, userId));

  const totalAnswers = answers.length;
  const recommendations: { careerId: number; matchScore: number }[] = [];

  for (const career of allCareers) {
    let score = 0;
    const categoryTag = career.category.toLowerCase().replace(/\s+/g, "-");
    if (tagCounts[career.category] !== undefined) {
      score += (tagCounts[career.category] / Math.max(totalAnswers, 1)) * 60;
    }
    if (tagCounts[categoryTag] !== undefined) {
      score += (tagCounts[categoryTag] / Math.max(totalAnswers, 1)) * 60;
    }
    // Bonus for matching top tags
    for (const tag of topCareerTags.slice(0, 3)) {
      if (career.category.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(career.category.toLowerCase().split(" ")[0])) {
        score += 10;
      }
    }
    // Random variance to differentiate careers
    score = Math.min(Math.round(score + Math.random() * 20), 95);
    recommendations.push({ careerId: career.id, matchScore: score });
  }

  // Sort by score descending and take top 7
  const topRecs = recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 7);

  if (topRecs.length > 0) {
    await db.insert(recommendationsTable).values(
      topRecs.map(r => ({ userId, careerId: r.careerId, matchScore: r.matchScore }))
    );
  }

  res.json({
    id: result.id,
    userId: result.userId,
    completedAt: result.completedAt,
    topCareerTags: result.topCareerTags,
    answers: result.answers,
  });
});

router.get("/assessment/results/:userId", async (req, res): Promise<void> => {
  const paramsParsed = GetAssessmentResultsParams.safeParse({
    userId: parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId, 10),
  });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid userId" }); return; }

  const [result] = await db
    .select()
    .from(assessmentResultsTable)
    .where(eq(assessmentResultsTable.userId, paramsParsed.data.userId))
    .orderBy(desc(assessmentResultsTable.completedAt))
    .limit(1);

  if (!result) { res.status(404).json({ error: "No assessment results found" }); return; }

  res.json({
    id: result.id,
    userId: result.userId,
    completedAt: result.completedAt,
    topCareerTags: result.topCareerTags,
    answers: result.answers,
  });
});

export default router;
