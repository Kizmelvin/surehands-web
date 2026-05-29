# Sure Hands Web — Roadmap & Next Steps

> Companion to [README.md](./README.md). This file enumerates everything beyond the current MVP that the product needs.

---

## ✅ Shipping in this pass

- Full email-and-password auth via Supabase Auth (sign-up, sign-in, sign-out, session refresh on every request via middleware).
- Role selection at sign-up (`client` or `worker`).
- **Profile photo upload at sign-up** → stored in the same `media` Supabase Storage bucket the mobile app uses; URL saved to `profiles.avatar_url`.
- Avatars surface everywhere: site header, `/account`, `WorkerCard`, worker profile detail.
- `/account` page to view & edit profile, swap avatar.
- Auth-aware site header (sign-in / sign-up CTAs vs avatar dropdown).
- Protected routes (`/account`, `/client/post-job`, `/worker/profile`, `/worker/interests`) gated by middleware.
- Mobile parity audit — schema and storage are already aligned (`profiles.avatar_url`, `media` bucket exist), so no migration is needed.

---

## 🚧 PRD features still to implement

### Trust & safety
- **NIN verification via SmileID** — webhook from SmileID flips `profiles.nin_verified` and surfaces a green badge.
- **15-second skill video upload** — record from the browser (`MediaRecorder` API) or upload a clip; store in `media/skill_videos/`.
- **Real reviews/ratings table** — `reviews(id, booking_id, rater_user_id, ratee_user_id, stars, comment, created_at)`. Aggregate with a recency-weighted average so quality compounds.

### Geospatial / matching
- **Mapbox map view** on `/client/workers` — pins per worker, draggable client pin, radius circle that updates results live.
- **Map picker** for job location in `/client/post-job` and worker base location in `/account`.
- **Distance matrix API** — replace fixture `distance_km` with live Mapbox Directions/Matrix calls so transport surcharge is honest.
- **`search_workers_within_radius` Postgres RPC** — `ST_DWithin` query against `workers.base_location` with category + availability filters; called from the workers page.

### Booking lifecycle
- **`bookings` table** with the PRD's 5-step state machine (`requested → accepted → en_route → in_progress → completed`).
- **Status timeline UI** on `/client/jobs/[id]` and `/worker/jobs/[id]` that POSTs status transitions.
- **Confirm-complete handshake** — client confirms, worker is paid (or marked as paid in Phase 1 cash flow).

### Payments
- **Paystack escrow + commission** — Phase 2 of the PRD. Webhook handler at `/api/webhooks/paystack` that records subscriptions and job payments. Commission split server-side.
- **Worker subscription billing** — current `subscriptions` table already exists; wire the Paystack checkout for monthly/yearly plans.
- **Transport surcharge as a separate line item** on every invoice.

### Communication
- **In-app messaging** — Supabase Realtime channel per booking, simple thread UI.
- **Notifications** — bell icon in header, fed by a `notifications` table; push triggers via Supabase Realtime.
- **Call-tap ROI logging** — when a client taps "Call worker", insert into `call_events` (table already exists).

### Operations
- **Admin moderation dashboard** at `/admin` — gated by `profiles.role = 'admin'`. Queues: pending verifications, flagged reviews, SLA breaches.
- **SLA timer enforcement** — Edge Function consuming `sla_timers` to warn / escalate / breach.

### Phase 2 — AI
- **RAG search assistant** — natural-language query box ("electrician for generator today") backed by an embeddings table and a Supabase Vector / pgvector index.
- **Predictive demand modeling** — nightly job that scores neighborhoods by category demand; ping idle workers to relocate.

---

## 📋 Quality-of-life and growth items

- **Onboarding wizard** for workers: 4-step setup (basics → location → skills → KYC) with progress bar.
- **Worker dashboard analytics**: weekly funnel (impressions → proposals → accepted → completed → reviewed).
- **Saved searches and favorites** for clients.
- **Referral program** — workers and clients invite peers, both get a credit.
- **Internationalization** — Igbo language toggle for Enugu market.
- **Accessibility audit** — keyboard navigation, focus rings, ARIA labels on interactive widgets.
- **OG image + open graph metadata** per route for WhatsApp share previews.
- **Analytics** — PostHog or Plausible for funnel + retention tracking.
- **Error monitoring** — Sentry or Logflare.

---

## 🧪 Testing & CI

- Unit tests with Vitest for `lib/fixtures.ts` helpers and validation utilities.
- Playwright e2e covering: sign-up → role select → photo upload → see avatar; post a job; submit a proposal.
- GitHub Actions: type-check, build, lint, e2e on PRs.

---

## 🛰 Deployment

See the dedicated [DEPLOY.md](./DEPLOY.md) for the GitHub + Vercel push steps.
