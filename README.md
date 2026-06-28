# Sure Hands — Web

Next.js (App Router) + TypeScript + Tailwind web companion to the [Sure Hands mobile app](../sure-hands).

## What's in this MVP

| Surface | Path | Purpose |
| --- | --- | --- |
| Landing | `/` | Hero, how-it-works, trust pillars, category grid, worker CTA. |
| Client home | `/client` | Dashboard with categories and available workers. |
| Post a job | `/client/post-job` | Title, description, category, neighbourhood, budget, urgency. |
| Browse workers | `/client/workers` | Filterable list: category, radius (1–5 km), availability, NIN-verified. |
| Worker profile | `/client/workers/[id]` | Bio, skills, skill video, reviews, hourly pricing. |
| Job detail (client view) | `/client/jobs/[id]` | Posted job + proposals + lifecycle tracker. |
| Worker home | `/worker` | Availability toggle, weekly earnings, nearby jobs. |
| Worker profile editor | `/worker/profile` | KYC checklist (NIN, video), basic details, availability. |
| Worker jobs feed | `/worker/jobs` | Tabs (for-you/all/recent) + radius/budget filters. |
| Job detail (worker view) | `/worker/jobs/[id]` | Submit a proposal with quote, ETA, message. |
| My interests | `/worker/interests` | Track every proposal you've submitted. |

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript 5
- Tailwind CSS 3 with a brand palette mirroring the mobile app's green tokens
- `@supabase/supabase-js` wired in `lib/supabase.ts` (reuses mobile app's project)
- Fixture data in `lib/fixtures.ts` so the UI renders without auth

## Not built yet (intentional)

These were excluded from this MVP scope and are the natural next milestones:

- **Auth** — phone OTP / email magic link / role selection. The mobile app has it; the web hook-up is straightforward via `@supabase/ssr` cookies.
- **Live Supabase queries** — fixtures stand in for `workers`, `jobs`, `service_categories`. Once auth is in, swap fixtures for `supabase.from(...)` calls and a `search_workers_within_radius` RPC.
- **Map view** — radius search is a slider + list today. Mapbox/Google Maps integration would render pins + a draggable client pin.
- **Booking lifecycle** — UI shows `Requested → Accepted → En route → In progress → Completed`, but the database currently models proposals, not bookings (see `../sure-hands/ALIGNMENT.md`).
- **Payments** — Paystack keys are provisioned but no webhook handler yet.

## Run it

```bash
cd sure-hands-web
npm install
cp .env.local.example .env.local   # or rely on the .env.local that's already there
npm run dev                        # http://localhost:3000
```

## Project layout

```
sure-hands-web/
├── app/
│   ├── layout.tsx              Root layout + header/footer
│   ├── page.tsx                Marketing landing
│   ├── not-found.tsx
│   ├── client/                 Client portal
│   │   ├── page.tsx
│   │   ├── post-job/page.tsx
│   │   ├── workers/page.tsx
│   │   ├── workers/[id]/page.tsx
│   │   └── jobs/[id]/page.tsx
│   └── worker/                 Worker portal
│       ├── page.tsx
│       ├── profile/page.tsx
│       ├── jobs/page.tsx
│       ├── jobs/[id]/page.tsx
│       └── interests/page.tsx
├── components/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── worker-card.tsx
│   └── job-card.tsx
├── lib/
│   ├── supabase.ts             Lazy Supabase client (env-gated)
│   └── fixtures.ts             Seed workers, jobs, categories, helpers
└── types/db.ts
```

## See also

- [../sure-hands/ALIGNMENT.md](../sure-hands/ALIGNMENT.md) — PRD-vs-built audit for the mobile app.
- [../sure-hands/supabase_schema.sql](../sure-hands/supabase_schema.sql) — source of truth for the data model this web app should eventually read from.
