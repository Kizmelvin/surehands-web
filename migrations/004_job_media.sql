-- 004_job_media.sql
-- Lets clients attach photo/video URLs to a posted job ("here's the leak").
-- Safe to re-run.

begin;

alter table public.jobs
  add column if not exists media_urls text[] not null default '{}';

commit;
