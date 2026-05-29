import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "./avatar";

export async function SiteHeader() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  let role: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle();
    displayName = profile?.full_name ?? user.email ?? null;
    avatarUrl = profile?.avatar_url ?? null;
    role = profile?.role ?? null;
  }

  const dashboardHref = role === "worker" ? "/worker" : role === "client" ? "/client" : null;

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-soft">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M5 11.5 9 15l10-10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Sure <span className="text-brand-600">Hands</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#how" className="text-sm font-medium text-gray-700 hover:text-brand-700">
            How it works
          </Link>
          <Link href="/client/workers" className="text-sm font-medium text-gray-700 hover:text-brand-700">
            Find a worker
          </Link>
          <Link href="/worker/jobs" className="text-sm font-medium text-gray-700 hover:text-brand-700">
            Browse jobs
          </Link>
          <Link href="/#trust" className="text-sm font-medium text-gray-700 hover:text-brand-700">
            Trust &amp; safety
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {dashboardHref && (
                <Link href={dashboardHref} className="btn-ghost hidden sm:inline-flex">
                  Dashboard
                </Link>
              )}
              <Link href="/account" className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 transition hover:border-brand-300 hover:bg-brand-50">
                <Avatar url={avatarUrl} name={displayName} size="xs" />
                <span className="hidden text-sm font-medium text-gray-800 sm:inline">
                  {displayName?.split(" ")[0] ?? "Account"}
                </span>
              </Link>
              <form action="/auth/sign-out" method="POST" className="hidden sm:block">
                <button type="submit" className="btn-ghost" aria-label="Sign out">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="btn-ghost hidden sm:inline-flex">
                Sign in
              </Link>
              <Link href="/auth/sign-up" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
