-- 001_bookings_and_reviews.sql
-- Adds the PRD's booking lifecycle and a real reviews table.
-- Safe to re-run.

begin;

-- ----------
-- BOOKING STATUS ENUM
-- Mirrors the PRD: Requested -> Accepted -> En Route -> In Progress -> Completed (or Canceled)
-- ----------
do $$ begin
  create type public.booking_status as enum (
    'requested',
    'accepted',
    'en_route',
    'in_progress',
    'completed',
    'canceled'
  );
exception
  when duplicate_object then null;
end $$;

-- ----------
-- BOOKINGS
-- One booking represents a job that has been accepted (or is in flight) between
-- a single client and a single worker. Created when a client accepts a proposal.
-- ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  proposal_id uuid not null references public.job_proposals (id) on delete cascade,
  client_user_id uuid not null references public.profiles (id) on delete cascade,
  worker_user_id uuid not null references public.profiles (id) on delete cascade,
  status public.booking_status not null default 'requested',

  agreed_price integer not null,
  scheduled_at timestamptz,
  accepted_at timestamptz,
  en_route_at timestamptz,
  in_progress_at timestamptz,
  completed_at timestamptz,
  canceled_at timestamptz,
  cancel_reason text,

  client_confirmed_complete boolean not null default false,
  worker_marked_complete boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A given proposal can only become at most one booking
  unique (proposal_id)
);

create index if not exists bookings_job_idx on public.bookings (job_id);
create index if not exists bookings_client_idx on public.bookings (client_user_id);
create index if not exists bookings_worker_idx on public.bookings (worker_user_id);
create index if not exists bookings_status_idx on public.bookings (status);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$ begin
  create trigger bookings_set_updated_at
    before update on public.bookings
    for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end $$;

-- ----------
-- REVIEWS
-- Recency-weighted 5-star ratings. Either party can rate the other after a booking
-- transitions to 'completed'. Aggregated for the worker's profile card via a view.
-- ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  rater_user_id uuid not null references public.profiles (id) on delete cascade,
  ratee_user_id uuid not null references public.profiles (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  -- One rating per (booking, rater) pair
  unique (booking_id, rater_user_id)
);

create index if not exists reviews_ratee_idx on public.reviews (ratee_user_id);
create index if not exists reviews_booking_idx on public.reviews (booking_id);
create index if not exists reviews_recent_idx on public.reviews (ratee_user_id, created_at desc);

-- Recency-weighted aggregate (last 90 days count 2x, older count 1x)
create or replace view public.worker_review_aggregate as
select
  ratee_user_id as worker_user_id,
  count(*)::int                                  as reviews_count,
  round(
    sum(
      stars::numeric *
      case when created_at >= now() - interval '90 days' then 2 else 1 end
    ) /
    nullif(
      sum(case when created_at >= now() - interval '90 days' then 2 else 1 end),
      0
    ),
    2
  ) as weighted_avg_stars,
  round(avg(stars)::numeric, 2) as raw_avg_stars
from public.reviews
group by ratee_user_id;

-- ----------
-- RLS
-- ----------
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "bookings_select_party" on public.bookings;
create policy "bookings_select_party" on public.bookings
  for select to authenticated
  using (
    auth.uid() = client_user_id
    or auth.uid() = worker_user_id
  );

drop policy if exists "bookings_insert_client" on public.bookings;
create policy "bookings_insert_client" on public.bookings
  for insert to authenticated
  with check (auth.uid() = client_user_id);

drop policy if exists "bookings_update_party" on public.bookings;
create policy "bookings_update_party" on public.bookings
  for update to authenticated
  using (
    auth.uid() = client_user_id
    or auth.uid() = worker_user_id
  )
  with check (
    auth.uid() = client_user_id
    or auth.uid() = worker_user_id
  );

drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews
  for select to anon, authenticated
  using (true);

drop policy if exists "reviews_insert_self" on public.reviews;
create policy "reviews_insert_self" on public.reviews
  for insert to authenticated
  with check (auth.uid() = rater_user_id);

commit;
