"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/fixtures";

export type VideoReviewRowData = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  category_name: string | null;
  skill_video_url: string | null;
  skill_video_submitted_at: string | null;
};

export function VideoReviewRow({ row }: { row: VideoReviewRowData }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function approve() {
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("workers")
      .update({
        skill_video_verified: true,
        skill_video_rejected_reason: null,
      })
      .eq("user_id", row.user_id);

    if (err) {
      setError(err.message);
      return;
    }
    setDone("approved");
    startTransition(() => router.refresh());
  }

  async function submitReject() {
    setError(null);
    const reason = rejectReason.trim();
    if (!reason) {
      setError("Give a short reason so the worker knows what to fix.");
      return;
    }
    const supabase = createClient();
    const { error: err } = await supabase
      .from("workers")
      .update({
        skill_video_verified: false,
        skill_video_rejected_reason: reason,
      })
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
            <p className="truncate text-base font-semibold text-gray-900">
              {row.full_name ?? "Unnamed worker"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {row.email ?? "no email"}
              {row.category_name ? ` · ${row.category_name}` : ""}
            </p>
            {row.skill_video_submitted_at && (
              <p className="mt-1 text-xs text-gray-500">
                Submitted {timeAgo(row.skill_video_submitted_at)}
              </p>
            )}

            {row.skill_video_url ? (
              <video
                src={row.skill_video_url}
                controls
                playsInline
                className="mt-3 w-full max-w-md rounded-xl border border-gray-200 bg-black"
              />
            ) : (
              <p className="mt-3 text-xs text-rose-600">
                No video URL on file — this shouldn&apos;t happen. Reject with a
                note and ask the worker to re-upload.
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 lg:min-w-[220px]">
          {row.skill_video_url && (
            <a
              href={row.skill_video_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              Open in new tab →
            </a>
          )}

          {!rejecting ? (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={approve}
                disabled={busy || !row.skill_video_url}
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
                placeholder="Reason (shown to the worker)"
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
