import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WorkerRow, type AdminWorkerRow } from "./worker-row";

export const dynamic = "force-dynamic";

async function loadWorkers(): Promise<AdminWorkerRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workers")
    .select(
      `
      user_id,
      verification_status,
      is_visible,
      is_available,
      has_skill_video,
      created_at,
      profiles:profiles!inner (
        id,
        full_name,
        email,
        avatar_url,
        nin_verified,
        operating_city
      )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];

  return data.map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      user_id: r.user_id,
      full_name: p?.full_name ?? null,
      email: p?.email ?? null,
      avatar_url: p?.avatar_url ?? null,
      operating_city: p?.operating_city ?? null,
      nin_verified: !!p?.nin_verified,
      verification_status: (r.verification_status ?? "pending") as string,
      is_visible: !!r.is_visible,
      is_available: !!r.is_available,
      has_skill_video: !!r.has_skill_video,
      created_at: r.created_at,
    };
  });
}

export default async function AdminWorkersPage() {
  const workers = await loadWorkers();

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
          <p className="mt-1 text-sm text-gray-600">
            {workers.length} on file. Toggle visibility / availability from the row.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-brand-700 hover:underline">
          ← Overview
        </Link>
      </header>

      {workers.length === 0 ? (
        <div className="card text-center text-gray-600">
          <p className="text-3xl">🧰</p>
          <p className="mt-2 text-base font-semibold text-gray-900">No workers yet.</p>
          <p className="mt-1 text-sm">
            When workers sign up and complete profile setup they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {workers.map((w) => (
            <WorkerRow key={w.user_id} row={w} />
          ))}
        </ul>
      )}
    </div>
  );
}
