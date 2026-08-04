-- 007_skill_video_verification.sql
-- Mirrors the NIN verification pattern (migration 006) for the worker's
-- 15-second skill video. Adds submitted-at + verified + rejected-reason
-- columns so /admin/kyc can approve/reject each video independently of
-- NIN.
--
-- The `skill_video_url` and `has_skill_video` columns already exist from
-- the mobile app's supabase_schema.sql — this only adds the verification
-- lifecycle columns and lets the trigger keep the two boolean fields in
-- sync.
--
-- Safe to re-run.

begin;

-- ============================================================
-- (a) Verification-lifecycle columns on workers
-- ============================================================

alter table public.workers
  add column if not exists skill_video_submitted_at timestamptz,
  add column if not exists skill_video_verified boolean not null default false,
  add column if not exists skill_video_rejected_reason text;

-- ============================================================
-- (b) Keep has_skill_video in sync with skill_video_url so we don't have
--     to remember to update both from the app code.
-- ============================================================

create or replace function public.workers_sync_has_skill_video()
returns trigger
language plpgsql
as $$
begin
  new.has_skill_video := (new.skill_video_url is not null and length(new.skill_video_url) > 0);
  return new;
end;
$$;

drop trigger if exists workers_has_skill_video_sync on public.workers;
create trigger workers_has_skill_video_sync
  before insert or update of skill_video_url on public.workers
  for each row execute function public.workers_sync_has_skill_video();

-- ============================================================
-- (c) Backfill: mark any existing rows with a url as has_skill_video=true
-- ============================================================

update public.workers
  set has_skill_video = true
  where skill_video_url is not null
    and length(skill_video_url) > 0
    and has_skill_video = false;

-- ============================================================
-- (d) Index to make the admin queue query fast
-- ============================================================

create index if not exists workers_skill_video_pending_idx
  on public.workers (skill_video_submitted_at)
  where skill_video_url is not null
    and skill_video_verified = false
    and skill_video_rejected_reason is null;

commit;
