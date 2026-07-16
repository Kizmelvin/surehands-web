import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KycRow, type KycRowData } from "./kyc-row";

export const dynamic = "force-dynamic";

async function loadPendingKyc(): Promise<KycRowData[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workers")
    .select(
      `
      user_id,
      verification_status,
      verification_photo_url,
      skill_video_url,
      has_skill_video,
      is_visible,
      created_at,
      profiles:profiles!inner (
        id,
        full_name,
        email,
        phone,
        avatar_url,
        nin_verified
      )
      `,
    )
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error || !data) return [];

  return data.map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      user_id: row.user_id,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      avatar_url: profile?.avatar_url ?? null,
      nin_verified: !!profile?.nin_verified,
      verification_photo_url: row.verification_photo_url,
      skill_video_url: row.skill_video_url,
      has_skill_video: !!row.has_skill_video,
      is_visible: !!row.is_visible,
      created_at: row.created_at,
    };
  });
}

export default async function KycPage() {
  const pending = await loadPendingKyc();

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC queue</h1>
          <p className="mt-1 text-sm text-gray-600">
            {pending.length} worker{pending.length === 1 ? "" : "s"} awaiting verification.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-brand-700 hover:underline">
          ← Overview
        </Link>
      </header>

      {pending.length === 0 ? (
        <div className="card text-center text-gray-600">
          <p className="text-3xl">🎉</p>
          <p className="mt-2 text-base font-semibold text-gray-900">Nothing pending.</p>
          <p className="mt-1 text-sm">All submitted workers have been reviewed.</p>
          <p className="mt-4 text-xs text-gray-500">
            If you expect entries here and see none, the <code>workers</code> table may not exist yet.
            Run <code>migrations/001_bookings_and_reviews.sql</code> and the mobile app&apos;s
            <code>supabase_schema.sql</code> in the Supabase SQL editor.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map((row) => (
            <KycRow key={row.user_id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}
