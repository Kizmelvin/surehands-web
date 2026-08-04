import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { AccountEditor } from "./account-editor";
import { NinVerify } from "@/components/nin-verify";
import { SkillVideoVerify } from "@/components/skill-video-verify";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, phone, avatar_url, nin_verified, nin_submitted, nin_submitted_at, nin_rejected_reason, operating_city, resident_city")
    .eq("id", user.id)
    .maybeSingle();

  // Pull worker-only extras (safe: query returns null if user isn't a worker).
  const { data: workerRow } = await supabase
    .from("workers")
    .select(
      "category_id, operating_neighbourhoods, skill_video_url, skill_video_submitted_at, skill_video_verified, skill_video_rejected_reason",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  // Best-effort fallback for the legacy edge case where the trigger hasn't run
  // (e.g. account was created before migration 003 was applied). The trigger
  // is now the canonical path — this is just defensive.
  const fallbackFullName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    null;
  const fallbackPhone =
    profile?.phone ??
    (user.user_metadata?.phone as string | undefined) ??
    null;
  const role =
    profile?.role ??
    (user.user_metadata?.role as "client" | "worker" | undefined) ??
    "client";

  const dashboardHref = role === "worker" ? "/worker" : "/client";
  const needsProfileCompletion = !profile?.resident_city;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-700">Your account</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {fallbackFullName ? `Welcome, ${fallbackFullName.split(" ")[0]}` : "Complete your profile"}
          </h1>
          <p className="mt-1 text-sm text-gray-600 capitalize">{role}</p>
        </div>
        <Link href={dashboardHref} className="btn-secondary">Go to dashboard →</Link>
      </header>

      {needsProfileCompletion && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">One more step</p>
          <p className="mt-1 text-amber-700">
            Tell us where you live so we can match you with workers in your area. Scroll down to fill in your
            resident neighbourhood (and operating neighbourhood, if you&apos;re a worker).
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AccountEditor
          userId={user.id}
          email={user.email ?? ""}
          initial={{
            full_name: fallbackFullName ?? "",
            phone: fallbackPhone ?? "",
            avatar_url: profile?.avatar_url ?? null,
            role: role as "client" | "worker",
            operating_city: profile?.operating_city ?? "",
            resident_city: profile?.resident_city ?? "",
            operating_neighbourhoods: (workerRow?.operating_neighbourhoods ?? []) as string[],
          }}
          profileExists={!!profile}
          workerRowExists={!!workerRow}
          // Lock full_name only once it's been set in the DB — the trigger usually sets it,
          // but if it's missing (legacy account), let the user enter it once.
          lockFullName={!!profile?.full_name}
        />

          <NinVerify
            userId={user.id}
            initialNin={(profile as { nin_submitted?: string | null } | null)?.nin_submitted ?? null}
            initialSubmittedAt={(profile as { nin_submitted_at?: string | null } | null)?.nin_submitted_at ?? null}
            initialVerified={!!profile?.nin_verified}
            initialRejectedReason={(profile as { nin_rejected_reason?: string | null } | null)?.nin_rejected_reason ?? null}
          />

          {role === "worker" && workerRow && (
            <SkillVideoVerify
              userId={user.id}
              initialUrl={
                (workerRow as { skill_video_url?: string | null }).skill_video_url ?? null
              }
              initialSubmittedAt={
                (workerRow as { skill_video_submitted_at?: string | null })
                  .skill_video_submitted_at ?? null
              }
              initialVerified={
                !!(workerRow as { skill_video_verified?: boolean }).skill_video_verified
              }
              initialRejectedReason={
                (workerRow as { skill_video_rejected_reason?: string | null })
                  .skill_video_rejected_reason ?? null
              }
            />
          )}
        </div>

        <aside className="space-y-4">
          <div className="card text-center">
            <Avatar url={profile?.avatar_url} name={fallbackFullName} size="lg" className="mx-auto" />
            <p className="mt-3 text-sm font-semibold text-gray-900">{fallbackFullName ?? "Add your name"}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {profile?.nin_verified ? (
                <span className="chip-brand">✓ NIN verified</span>
              ) : (
                <span className="chip">NIN pending</span>
              )}
              <span className="chip capitalize">{role}</span>
            </div>
          </div>

          <form action="/auth/sign-out" method="POST">
            <button type="submit" className="btn-ghost w-full text-rose-600 hover:bg-rose-50">
              Sign out
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
