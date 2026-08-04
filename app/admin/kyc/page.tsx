import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KycRow, type KycRowData } from "./kyc-row";
import { VideoReviewRow, type VideoReviewRowData } from "./video-row";

export const dynamic = "force-dynamic";

async function loadPendingNin(): Promise<KycRowData[]> {
  const supabase = createClient();

  // Everyone (client or worker) who submitted a NIN that hasn't been approved
  // or rejected yet.
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, role, full_name, email, phone, avatar_url, nin_submitted, nin_submitted_at, nin_verified, nin_rejected_reason",
    )
    .not("nin_submitted", "is", null)
    .eq("nin_verified", false)
    .is("nin_rejected_reason", null)
    .order("nin_submitted_at", { ascending: true })
    .limit(100);

  if (error || !profiles) return [];

  // Enrich each row with the matching worker row (if any) so we can show
  // whether they also need worker verification.
  const ids = profiles.map((p) => p.id);
  const { data: workers } = ids.length
    ? await supabase
        .from("workers")
        .select(
          "user_id, verification_status, verification_photo_url, skill_video_url, has_skill_video, is_visible",
        )
        .in("user_id", ids)
    : { data: [] };

  const workerByUserId = new Map(
    (workers ?? []).map((w) => [w.user_id as string, w] as const),
  );

  return profiles.map((p) => {
    const w = workerByUserId.get(p.id);
    return {
      user_id: p.id,
      full_name: p.full_name ?? null,
      email: p.email ?? null,
      phone: p.phone ?? null,
      avatar_url: p.avatar_url ?? null,
      role: (p.role ?? "client") as string,
      nin_submitted: (p as { nin_submitted?: string | null }).nin_submitted ?? null,
      nin_submitted_at: (p as { nin_submitted_at?: string | null }).nin_submitted_at ?? null,
      nin_verified: !!p.nin_verified,
      has_worker_row: !!w,
      verification_status: (w?.verification_status ?? null) as string | null,
      verification_photo_url: w?.verification_photo_url ?? null,
      skill_video_url: w?.skill_video_url ?? null,
      has_skill_video: !!w?.has_skill_video,
      is_visible: !!w?.is_visible,
      created_at:
        (p as { nin_submitted_at?: string | null }).nin_submitted_at ??
        new Date().toISOString(),
    };
  });
}

async function loadPendingVideos(): Promise<VideoReviewRowData[]> {
  const supabase = createClient();

  // Workers who submitted a skill video that hasn't been approved or rejected.
  const { data: workers, error } = await supabase
    .from("workers")
    .select(
      "user_id, skill_video_url, skill_video_submitted_at, skill_video_verified, skill_video_rejected_reason, category_id",
    )
    .not("skill_video_url", "is", null)
    .eq("skill_video_verified", false)
    .is("skill_video_rejected_reason", null)
    .order("skill_video_submitted_at", { ascending: true })
    .limit(100);

  if (error || !workers || workers.length === 0) return [];

  const ids = workers.map((w) => w.user_id as string);

  const [{ data: profiles }, { data: categories }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", ids),
    supabase.from("service_categories").select("id, name"),
  ]);

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id as string, p] as const),
  );
  const categoryById = new Map(
    (categories ?? []).map((c) => [c.id as string, c.name as string] as const),
  );

  return workers.map((w) => {
    const p = profileById.get(w.user_id as string);
    return {
      user_id: w.user_id as string,
      full_name: p?.full_name ?? null,
      email: p?.email ?? null,
      avatar_url: p?.avatar_url ?? null,
      category_name: w.category_id ? (categoryById.get(w.category_id as string) ?? null) : null,
      skill_video_url: (w.skill_video_url as string | null) ?? null,
      skill_video_submitted_at: (w.skill_video_submitted_at as string | null) ?? null,
    };
  });
}

export default async function KycPage() {
  const [pendingNin, pendingVideos] = await Promise.all([
    loadPendingNin(),
    loadPendingVideos(),
  ]);

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification queue</h1>
          <p className="mt-1 text-sm text-gray-600">
            {pendingNin.length} NIN{pendingNin.length === 1 ? "" : "s"} ·{" "}
            {pendingVideos.length} skill video{pendingVideos.length === 1 ? "" : "s"} awaiting review.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-brand-700 hover:underline">
          ← Overview
        </Link>
      </header>

      <section id="nin-queue">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          NIN queue ({pendingNin.length})
        </h2>
        {pendingNin.length === 0 ? (
          <div className="card text-center text-gray-600">
            <p className="text-3xl">🎉</p>
            <p className="mt-2 text-base font-semibold text-gray-900">No NINs pending.</p>
            <p className="mt-1 text-sm">All submitted NINs have been reviewed.</p>
            <p className="mt-4 text-xs text-gray-500">
              If you expect entries here and see none, make sure you&apos;ve run{" "}
              <code>migrations/006_nin_storage_and_admin_rls.sql</code> — it adds
              the admin-scope RLS policies that let you see other users&apos; NIN
              submissions.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {pendingNin.map((row) => (
              <KycRow key={row.user_id} row={row} />
            ))}
          </ul>
        )}
      </section>

      <section id="video-queue">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Skill video queue ({pendingVideos.length})
        </h2>
        {pendingVideos.length === 0 ? (
          <div className="card text-center text-gray-600">
            <p className="text-3xl">🎬</p>
            <p className="mt-2 text-base font-semibold text-gray-900">
              No skill videos pending.
            </p>
            <p className="mt-1 text-sm">
              Videos appear here as soon as a worker uploads one from{" "}
              <code>/account</code>.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              If you expect entries here and see none, make sure{" "}
              <code>migrations/007_skill_video_verification.sql</code> has run —
              it adds the lifecycle columns this query relies on.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {pendingVideos.map((row) => (
              <VideoReviewRow key={row.user_id} row={row} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
