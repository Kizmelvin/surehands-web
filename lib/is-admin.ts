import { createClient } from "@/lib/supabase/server";

/**
 * Server-side admin check. Returns the (user, profile) tuple if the caller is an
 * authenticated admin, otherwise `null` — the caller is expected to `redirect()`.
 *
 * A user is considered an admin when `profiles.role = 'admin'`.
 * Bootstrap: promote your first admin manually in the Supabase SQL editor:
 *   update public.profiles set role = 'admin' where email = 'you@example.com';
 */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return null;
  return { user, profile };
}
