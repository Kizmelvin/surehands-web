-- 006_nin_storage_and_admin_rls.sql
-- Ships 4 fixes together:
--   (a) Ensure the `media` storage bucket exists with correct policies.
--       Without these, avatar uploads fail with "row violates row-level
--       security policy" even when the user is properly signed in — the
--       default deny hits because no policy grants INSERT for authenticated
--       users on `storage.objects`.
--   (b) Add `profiles.nin_submitted` + `nin_submitted_at` + `nin_rejected_reason`
--       so we can collect NINs client-side and let an admin approve/reject
--       from /admin/kyc without any external verification vendor wired.
--   (c) Add `public.is_admin()` helper (SECURITY DEFINER) that RLS policies
--       can call without recursing into `profiles`.
--   (d) Add admin RLS policies on profiles, workers, bookings, reviews,
--       jobs so the admin console can see every user's data (currently it
--       returns 0 rows because the base policies scope reads to the row
--       owner).
--
-- Safe to re-run.

begin;

-- ============================================================
-- (a) Storage bucket + policies
-- ============================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media_upload_own" on storage.objects;
create policy "media_upload_own" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "media_update_own" on storage.objects;
create policy "media_update_own" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "media_delete_own" on storage.objects;
create policy "media_delete_own" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- (b) NIN submission columns on profiles
-- ============================================================

alter table public.profiles
  add column if not exists nin_submitted text,
  add column if not exists nin_submitted_at timestamptz,
  add column if not exists nin_rejected_reason text;

-- Ensure the NIN is either NULL or exactly 11 digits
do $$ begin
  alter table public.profiles
    add constraint profiles_nin_submitted_format
    check (nin_submitted is null or nin_submitted ~ '^[0-9]{11}$');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- (c) is_admin() helper — avoids RLS recursion
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- (d) Admin RLS policies (permissive — layered on top of existing)
-- ============================================================

-- profiles: admins can read every row and update NIN status
drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- workers: admins can read + update every row (needed for KYC approval)
alter table public.workers enable row level security;

drop policy if exists "workers_admin_read" on public.workers;
create policy "workers_admin_read" on public.workers
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "workers_admin_update" on public.workers;
create policy "workers_admin_update" on public.workers
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- bookings: admins can read all
drop policy if exists "bookings_admin_read" on public.bookings;
create policy "bookings_admin_read" on public.bookings
  for select
  to authenticated
  using (public.is_admin());

-- reviews (already publicly readable — nothing to add for admins)

-- jobs: admins can read all
alter table public.jobs enable row level security;

drop policy if exists "jobs_admin_read" on public.jobs;
create policy "jobs_admin_read" on public.jobs
  for select
  to authenticated
  using (public.is_admin());

commit;
