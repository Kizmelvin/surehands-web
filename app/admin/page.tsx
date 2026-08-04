import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Stat = { label: string; value: string; hint?: string; href?: string };

async function loadStats(): Promise<Stat[]> {
  const supabase = createClient();

  const [workers, pendingNin, pendingVideos, jobs, bookings, reviews] = await Promise.all([
    supabase.from("workers").select("*", { count: "exact", head: true }),
    // NIN awaiting review
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("nin_submitted", "is", null)
      .eq("nin_verified", false)
      .is("nin_rejected_reason", null),
    // Skill videos awaiting review
    supabase
      .from("workers")
      .select("*", { count: "exact", head: true })
      .not("skill_video_url", "is", null)
      .eq("skill_video_verified", false)
      .is("skill_video_rejected_reason", null),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
  ]);

  const totalPending = (pendingNin.count ?? 0) + (pendingVideos.count ?? 0);

  return [
    { label: "Workers", value: fmt(workers.count), href: "/admin/workers" },
    {
      label: "Pending KYC",
      value: fmt(totalPending),
      hint: `${fmt(pendingNin.count)} NIN · ${fmt(pendingVideos.count)} video`,
      href: "/admin/kyc",
    },
    { label: "Jobs posted", value: fmt(jobs.count) },
    { label: "Bookings", value: fmt(bookings.count), href: "/admin/bookings" },
    { label: "Reviews", value: fmt(reviews.count) },
  ];
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("en-NG");
}

export default async function AdminOverviewPage() {
  const stats = await loadStats();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Snapshot of the Sure Hands platform. All numbers pulled live from Supabase.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const inner = (
            <div className="card h-full">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{s.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{s.value}</p>
              {s.hint && <p className="mt-1 text-xs text-brand-700">{s.hint}</p>}
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block transition hover:-translate-y-0.5">
              {inner}
            </Link>
          ) : (
            <div key={s.label}>{inner}</div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/kyc" className="card group">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Priority action</p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-brand-700">
            Review pending KYC
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Approve NIN + skill video for new workers so they can start receiving proposals.
          </p>
        </Link>
        <Link href="/admin/workers" className="card group">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Manage supply</p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-brand-700">
            Workers roster
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Toggle visibility, force-set availability, revoke verification.
          </p>
        </Link>
      </div>
    </div>
  );
}
