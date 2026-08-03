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
  role: string;
  nin_submitted: string | null;
  nin_submitted_at: string | null;
  nin_verified: boolean;
  has_worker_row: boolean;
  verification_status: string | null;
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
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function approve() {
    setError(null);
    const supabase = createClient();

    // Approving NIN also implicitly approves worker verification (if worker).
    const updates: PromiseLike<{ error: { message: string } | null }>[] = [
      supabase
        .from("profiles")
        .update({ nin_verified: true, nin_rejected_reason: null })
        .eq("id", row.user_id),
    ];

    if (row.has_worker_row) {
      updates.push(
        supabase
          .from("workers")
          .update({ verification_status: "approved", is_visible: true })
          .eq("user_id", row.user_id),
      );
    }

    const results = await Promise.all(updates);
    const firstErr = results.find((r) => r.error);
    if (firstErr?.error) {
      setError(firstErr.error.message);
      return;
    }

    setDone("approved");
    startTransition(() => router.refresh());
  }

  async function submitReject() {
    setError(null);
    const reason = rejectReason.trim();
    if (!reason) {
      setError("Give a short reason so the user knows what to fix.");
      return;
    }

    const supabase = createClient();
    const updates: PromiseLike<{ error: { message: string } | null }>[] = [
      supabase
        .from("profiles")
        .update({
          nin_verified: false,
          nin_rejected_reason: reason,
        })
        .eq("id", row.user_id),
    ];

    if (row.has_worker_row) {
      updates.push(
        supabase
          .from("workers")
          .update({ verification_status: "rejected", is_visible: false })
          .eq("user_id", row.user_id),
      );
    }

    const results = await Promise.all(updates);
    const firstErr = results.find((r) => r.error);
    if (firstErr?.error) {
      setError(firstErr.error.message);
      return;
    }

    setDone("rejected");
    startTransition(() => router.refresh());
  }

  if (done) {
    return (
      <li
        className={`card text-sm ${
          done === "approved"
            ? "border-brand-200 bg-brand-50 text-brand-800"
            : "border-rose-200 bg-rose-50 text-rose-800"
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
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold text-gray-900">
                {row.full_name ?? "Unnamed user"}
              </p>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-700">
                {row.role}
              </span>
            </div>
            <p className="truncate text-xs text-gray-500">
              {row.email ?? "no email"} · {row.phone ?? "no phone"}
            </p>
            {row.nin_submitted_at && (
              <p className="mt-1 text-xs text-gray-500">
                Submitted {timeAgo(row.nin_submitted_at)}
              </p>
            )}

            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Submitted NIN
              </p>
              <p className="mt-1 font-mono text-lg tracking-[0.3em] text-gray-900">
                {row.nin_submitted ?? "—"}
              </p>
              <p className="mt-2 text-[11px] text-gray-500">
                No external NIN verification is wired yet. Approve only after
                you&apos;ve verified this number through your own process.
              </p>
            </div>

            {row.has_worker_row && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusChip label="Worker profile" ok={true} />
                <StatusChip label="Skill video" ok={row.has_skill_video} />
                <StatusChip label="Verification photo" ok={!!row.verification_photo_url} />
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 lg:min-w-[220px]">
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

          {!rejecting ? (
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
                onClick={() => setRejecting(true)}
                disabled={busy}
                className="btn-ghost !py-2 !text-xs !text-rose-600 hover:!bg-rose-50"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <textarea
                className="input !text-xs"
                rows={2}
                placeholder="Reason (shown to the user)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submitReject}
                  disabled={busy || !rejectReason.trim()}
                  className="btn-primary !bg-rose-600 !py-2 !text-xs hover:!bg-rose-700"
                >
                  Confirm reject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(false);
                    setRejectReason("");
                    setError(null);
                  }}
                  className="btn-ghost !py-2 !text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
