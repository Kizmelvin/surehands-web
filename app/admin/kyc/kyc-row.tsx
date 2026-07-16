"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/fixtures";

export type KycRowData = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  nin_verified: boolean;
  verification_photo_url: string | null;
  skill_video_url: string | null;
  has_skill_video: boolean;
  is_visible: boolean;
  created_at: string;
};

export function KycRow({ row }: { row: KycRowData }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  async function approve() {
    setError(null);
    const supabase = createClient();

    // Mark worker approved + visible + NIN-verified in one batch
    const [wErr, pErr] = await Promise.all([
      supabase
        .from("workers")
        .update({ verification_status: "approved", is_visible: true })
        .eq("user_id", row.user_id),
      supabase.from("profiles").update({ nin_verified: true }).eq("id", row.user_id),
    ]).then((r) => [r[0].error, r[1].error]);

    if (wErr || pErr) {
      setError((wErr ?? pErr)?.message ?? "Update failed.");
      return;
    }
    setDone("approved");
    startTransition(() => router.refresh());
  }

  async function reject() {
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("workers")
      .update({ verification_status: "rejected", is_visible: false })
      .eq("user_id", row.user_id);
    if (err) {
      setError(err.message);
      return;
    }
    setDone("rejected");
    startTransition(() => router.refresh());
  }

  if (done) {
    return (
      <li
        className={`card text-sm ${
          done === "approved" ? "border-brand-200 bg-brand-50 text-brand-800" : "border-rose-200 bg-rose-50 text-rose-800"
        }`}
      >
        {done === "approved" ? "✓ Approved" : "✗ Rejected"} — {row.full_name ?? row.email}
      </li>
    );
  }

  return (
    <li className="card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar url={row.avatar_url} name={row.full_name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900">
              {row.full_name ?? "Unnamed worker"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {row.email ?? "no email"} · {row.phone ?? "no phone"}
            </p>
            <p className="mt-1 text-xs text-gray-500">Submitted {timeAgo(row.created_at)}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <StatusChip label="NIN" ok={row.nin_verified} />
              <StatusChip label="Skill video" ok={row.has_skill_video} />
              <StatusChip label="Verification photo" ok={!!row.verification_photo_url} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 lg:min-w-[180px]">
          {row.verification_photo_url && (
            <a
              href={row.verification_photo_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              View verification photo →
            </a>
          )}
          {row.skill_video_url && (
            <a
              href={row.skill_video_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              View skill video →
            </a>
          )}
          {!row.verification_photo_url && !row.skill_video_url && (
            <p className="text-xs text-gray-500">No media submitted yet.</p>
          )}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={approve}
              disabled={busy}
              className="btn-primary !py-2 !text-xs"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={reject}
              disabled={busy}
              className="btn-ghost !py-2 !text-xs !text-rose-600 hover:!bg-rose-50"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
      {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
    </li>
  );
}

function StatusChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        ok ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-brand-500" : "bg-gray-400"}`}
      />
      {label}
    </span>
  );
}
