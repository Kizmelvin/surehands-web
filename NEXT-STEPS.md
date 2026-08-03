# Sure Hands Web — Roadmap & Next Steps

> Companion to [README.md](./README.md). This file enumerates everything beyond the current MVP that the product needs.

---

## ✅ Shipped in `fix/nin-storage-rls-admin` (2026-08-04)

Bug fixes:

- **Photo upload keeps failing with RLS reject** — real cause: the `media` storage bucket's INSERT/UPDATE policies were never installed on this Supabase project (they live in the mobile app's `supabase_rls.sql` which was probably never applied). Migration 006 creates the bucket idempotently and installs the four policies (public read, upload own, update own, delete own).
- **Admin console shows "No workers yet" even when workers exist** — root cause: RLS on `workers` (and `bookings`, `jobs`, `profiles`) only allows a user to read their own row. Migration 006 adds an `is_admin()` helper (`SECURITY DEFINER` to avoid RLS recursion) and admin-scope read policies on all four tables.

Password reset now uses an OTP code (matches sign-up verification pattern):

- `/auth/forgot-password` sends the email via `resetPasswordForEmail` and redirects to `/auth/verify-reset?email=X` (was showing an inline "check your email" card).
- New `/auth/verify-reset` page — 6-digit code input, resend button, fallback link back to `/auth/reset-password` for users who received the legacy magic link. Calls `verifyOtp({ type: 'recovery' })`.
- Requires updating the Supabase **Reset Password** email template to include `{{ .Token }}` (Supabase Dashboard → Authentication → Email Templates).

New feature — NIN verification:

- **New `profiles.nin_submitted`, `nin_submitted_at`, `nin_rejected_reason` columns** (with a `CHECK` that the NIN is exactly 11 digits).
- **`/account` gets a NIN card** (`<NinVerify />`) — 4 states: unsubmitted, pending, approved, rejected. Rejected shows the admin's reason and lets the user re-submit.
- **`/admin/kyc` overhauled** — queue is now "NINs awaiting review" (was "workers with `verification_status = 'pending'`"). Each row shows the submitted NIN in monospace, an Approve button (also flips the workers row to approved+visible when applicable), and a Reject flow that requires a reason.
- Approving/rejecting a NIN also updates the worker verification state so admins don't have to touch two places.

> Explicitly deferred: no external NIN service is wired. Admins must verify each NIN through their own process before hitting Approve. See `migrations/006_nin_storage_and_admin_rls.sql` for the schema shape.

## ✅ Shipped in `fix/auth-worker-onboarding` (2026-07-15)

Bug fixes from real-user testing:

- **Photo upload RLS failure** — root cause: we were using the server-passed `userId` for the storage path, but the browser JWT's `auth.uid()` could differ if the session cookie was stale. Fixed by reading the client-side `auth.getUser()` and using *that* uid for the upload path. Error messaging now shows both uids side-by-side so any future mismatch is diagnosable.
- **"Existing email" sign-ups silently succeeding** — Supabase's default anti-enumeration behavior returns a fake success and sends no email. Now we detect the empty `identities` array and show a real error ("email already registered, try signing in").
- **Admin's "Dashboard" button routing back to `/admin`** — collapsed the button for admins; the amber "Admin" pill is now the single admin CTA.
- **Worker dashboard showing dummy Chibuzo data** — dashboard now loads the signed-in user's name/avatar, computes real weekly earnings + completed count from `bookings`, and pulls the weighted rating from `worker_review_aggregate`. Shows honest zeros for new accounts.

New features:

- **OTP-code signup verification** at `/auth/verify-otp` (6-digit code instead of a magic link). Sign-up now redirects here. Requires updating the Supabase "Confirm signup" email template to include `{{ .Token }}` (Supabase Dashboard → Authentication → Email Templates).
- **Forgot password / reset password** flow at `/auth/forgot-password` and `/auth/reset-password`. Wired into the sign-in page.
- **Worker category at signup** — required dropdown when role = "Worker".
- **Worker multi-operating neighbourhoods** — pick 1–3 areas at signup (also editable from `/account`). Stored in new `workers.operating_neighbourhoods text[]` column (migration 005).
- **Trigger creates the workers row at signup** — no more "your worker profile is pending" limbo for new signups. Migration 005 rewrites `handle_new_user()` to insert into `workers` with role, category, and operating areas from metadata.

## ✅ Shipped in `feat/admin-media-toggle` (2026-06-29)

- **Admin console at `/admin`** — layout with sidebar nav, gated by `profiles.role = 'admin'`. Pages: Overview (stats), KYC queue (approve/reject verification, batches worker + profile updates), Workers (visibility / availability toggles per row), Bookings (recent + status table). `requireAdmin()` helper (`lib/is-admin.ts`) does the role check. Header now shows an amber "Admin" pill when the signed-in user is an admin.
- **Photo/video upload on job posting** — new `MediaUploader` component (multi-file, 15 MB cap, images + video, preview + remove). Wired into `/client/post-job`. Adds `jobs.media_urls text[]` column via `migrations/004_job_media.sql`.
- **Availability toggle wired to Supabase** — worker dashboard reads current `is_available` on mount; toggle updates the DB with optimistic UI, revert on error, "saving…" / "saved · time" indicator, friendly error if no worker row yet.

### To promote your first admin, run this in the Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

Then sign out + sign back in — the `/admin` link appears in the header.

## ✅ Shipped in `C-DEV` (2026-06-29)

- **Auth flow fixes** — Postgres trigger (`migrations/003_profiles_trigger.sql`) auto-creates `public.profiles` from `auth.users` metadata, so `full_name` / `phone` / `role` from sign-up actually persist (previously dropped silently by RLS). Sign-up now redirects to a dedicated `/auth/check-email` page with a Resend button. Sign-in detects unconfirmed accounts and bounces them back to the explainer. `/account` uses UPSERT (no longer silently no-ops for legacy accounts), locks immutable fields (full_name once set, email, role), and shows a "Complete your profile" banner if `resident_city` is missing. Site header now shows just the avatar (no email text).
- **Bookings table + lifecycle** — `migrations/001_bookings_and_reviews.sql` adds `booking_status` enum, `bookings` table, `reviews` table, RLS, indexes, and a recency-weighted `worker_review_aggregate` view.
- **Geospatial RPC** — `migrations/002_search_workers_rpc.sql` adds `search_workers_within_radius(lat, lng, km, category, ...)` using `ST_DWithin`.
- **`BookingStatusTracker` component** (`components/booking-status-tracker.tsx`) — interactive client-/worker-driven state machine. Wired into both `/client/jobs/[id]` and `/worker/jobs/[id]`.
- **`ReviewForm` component** — appears after the worker marks a booking complete on the client side.
- **`searchWorkers()` data layer** (`lib/workers.ts`) — calls the new RPC, gracefully falls back to fixtures when migrations aren't applied. UI shows a Live/Seed badge so the source is always obvious.
- **Type additions** — `BookingStatus`, `BOOKING_STATUS_ORDER`, `Booking`, `Review` in `types/db.ts`.

> Run `migrations/001_*.sql` then `migrations/002_*.sql` in the Supabase SQL editor when you're ready to switch from seed data to live data.

## ✅ Shipped earlier

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
- **Distance matrix API** — replace fixture `distance_km` with live Mapbox Directions/Matrix calls so the distance shown to clients/workers is accurate.
- **`search_workers_within_radius` Postgres RPC** — `ST_DWithin` query against `workers.base_location` with category + availability filters; called from the workers page.

### Booking lifecycle
- **`bookings` table** with the PRD's 5-step state machine (`requested → accepted → en_route → in_progress → completed`).
- **Status timeline UI** on `/client/jobs/[id]` and `/worker/jobs/[id]` that POSTs status transitions.
- **Confirm-complete handshake** — client confirms, worker is paid (or marked as paid in Phase 1 cash flow).

### Payments
- **Paystack escrow + commission** — Phase 2 of the PRD. Webhook handler at `/api/webhooks/paystack` that records subscriptions and job payments. Commission split server-side.
- **Worker subscription billing** — current `subscriptions` table already exists; wire the Paystack checkout for monthly/yearly plans.
- **Worker payout policy** documented and surfaced in `/account`: workers see exactly what % the platform retains and when funds arrive.

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
