-- 005_worker_signup_fields.sql
-- 1. Adds workers.operating_neighbourhoods so workers can list 1–3 areas they cover.
-- 2. Upgrades handle_new_user() to also create the matching workers row (with
--    category_id + operating_neighbourhoods) when a user signs up with role='worker'.
--    Now sign-up alone is enough to make a worker searchable (once they pass KYC).
-- Safe to re-run.

begin;

-- ---- Schema addition ----------------------------------------------------
alter table public.workers
  add column if not exists operating_neighbourhoods text[] not null default '{}';

create index if not exists workers_operating_neighbourhoods_gin
  on public.workers using gin (operating_neighbourhoods);

-- ---- Trigger function (supersedes 003) ---------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role       public.user_role;
  meta_category   uuid;
  meta_operating  text[];
begin
  -- Role
  begin
    meta_role := coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'client'
    );
  exception when others then
    meta_role := 'client';
  end;

  -- Category (workers only, but parse defensively either way)
  begin
    meta_category := (new.raw_user_meta_data->>'category_id')::uuid;
  exception when others then
    meta_category := null;
  end;

  -- Operating neighbourhoods (comes in as a JSON array)
  begin
    select array(
      select jsonb_array_elements_text(new.raw_user_meta_data->'operating_neighbourhoods')
    ) into meta_operating;
  exception when others then
    meta_operating := '{}'::text[];
  end;

  -- 1) Always: create / refresh the profile row from metadata
  insert into public.profiles (id, role, full_name, email, phone)
  values (
    new.id,
    meta_role,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update
    set full_name  = coalesce(excluded.full_name, public.profiles.full_name),
        phone      = coalesce(excluded.phone,     public.profiles.phone),
        email      = coalesce(excluded.email,     public.profiles.email),
        updated_at = now();

  -- 2) Workers only: create the workers row so they appear in admin queues
  if meta_role = 'worker' then
    insert into public.workers (
      user_id,
      category_id,
      operating_neighbourhoods,
      verification_status,
      is_visible,
      is_available
    )
    values (
      new.id,
      meta_category,
      coalesce(meta_operating, '{}'::text[]),
      'pending',   -- appears in admin KYC queue
      false,       -- hidden until admin approves
      true
    )
    on conflict (user_id) do update
      set category_id              = coalesce(excluded.category_id, public.workers.category_id),
          operating_neighbourhoods = case
            when array_length(excluded.operating_neighbourhoods, 1) is not null
              then excluded.operating_neighbourhoods
            else public.workers.operating_neighbourhoods
          end,
          updated_at               = now();
  end if;

  return new;
end;
$$;

-- Trigger already installed by migration 003, but recreate defensively
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;
