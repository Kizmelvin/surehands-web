-- 003_profiles_trigger.sql
-- Auto-creates a public.profiles row whenever a new auth.users row is
-- inserted. Reads name, role, and phone from the user's raw_user_meta_data
-- (which the web app's sign-up sets via supabase.auth.signUp({ options: { data: ... } })).
--
-- SECURITY DEFINER lets this bypass RLS, which is why writes from the
-- unauthenticated sign-up flow no longer fail with "row violates
-- row-level security policy".
--
-- Safe to re-run.

begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role public.user_role;
begin
  -- Default to 'client' if metadata role is missing or invalid
  begin
    meta_role := coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'client'
    );
  exception when others then
    meta_role := 'client';
  end;

  insert into public.profiles (id, role, full_name, email, phone)
  values (
    new.id,
    meta_role,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update
    set
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      phone     = coalesce(excluded.phone,     public.profiles.phone),
      email     = coalesce(excluded.email,     public.profiles.email),
      updated_at = now();

  return new;
end;
$$;

-- Recreate the trigger idempotently
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;
