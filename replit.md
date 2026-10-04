# CareerPathr

A career guidance platform for college students. Students take an aptitude and interest assessment, receive personalized career recommendations with match scores, view skill-gap analysis, and get curated course and certification roadmaps. Admins can manage careers, questions, and courses.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at /api)
- `pnpm --filter @workspace/career-pathr run dev` — run the React frontend (port 19779, served at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, Tailwind CSS, shadcn/ui, Wouter (routing), TanStack Query, Framer Motion
- API: Express 5 + express-session + bcryptjs (password hashing)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit manually)
- `lib/api-zod/src/generated/` — generated Zod validation schemas (do not edit manually)
- `lib/db/src/schema/` — Drizzle table definitions (users, careers, courses, assessment questions/results, recommendations)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, students, careers, courses, questions, assessment, recommendations, admin)
- `artifacts/career-pathr/src/` — React frontend (pages, components)

## Architecture decisions

- Session-based auth (express-session) with bcryptjs password hashing — no JWT, no third-party auth provider
- OpenAPI-first workflow: spec → codegen → typed hooks on frontend + Zod validation on backend
- Assessment scoring: tallies career tags from answer options, computes per-career match score, stores as recommendations
- Skill gap analysis computed at query time by comparing student profile skills vs career required skills
- Admin user pre-seeded: `admin@careerpathr.com` / `admin123`

## Product

- Landing page with how-it-works, career category showcase, CTA
- Student registration + login
- 10-question aptitude/interest assessment (multi-step, animated)
- Career recommendations ranked by match percentage
- Skill-gap analysis: matched skills vs missing skills per career
- Career detail pages: job roles, salary, growth rate, learning time, embedded course list
- Learning roadmaps with courses, certifications, and roadmap resources per career (28 curated entries)
- Admin dashboard: stats, user list, full CRUD for careers, questions, and courses
- 7 career categories: Software Development, Cybersecurity, Data Science, Artificial Intelligence, Cloud Computing, UI/UX Design, Entrepreneurship

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` AND `pnpm run typecheck:libs` before working on server routes
- `@workspace/db` lib declarations need `pnpm run typecheck:libs` to rebuild before leaf artifact typechecks see new tables
- Session cookie is httpOnly; do not access via JS — use `/api/auth/me` to check auth state
- Admin seeded at `admin@careerpathr.com` / `admin123`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
