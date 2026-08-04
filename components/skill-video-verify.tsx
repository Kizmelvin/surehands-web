"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "unsubmitted" | "pending" | "approved" | "rejected";

type Props = {
  userId: string;
  initialUrl: string | null;
  initialSubmittedAt: string | null;
  initialVerified: boolean;
  initialRejectedReason: string | null;
};

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB — videos are big
const MAX_SECONDS = 20; // PRD says 15s, allow a small buffer

/**
 * Mirrors <NinVerify /> but for the worker's short skill video.
 *
 * Status derivation (same shape as the admin sees in /admin/kyc):
 *   approved    => skill_video_verified = true
 *   rejected    => skill_video_verified = false AND skill_video_rejected_reason is set
 *   pending     => skill_video_url is set, awaiting admin review
 *   unsubmitted => nothing uploaded yet
 */
export function SkillVideoVerify({
  userId,
  initialUrl,
  initialSubmittedAt,
  initialVerified,
  initialRejectedReason,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const derive = (): Status => {
    if (initialVerified) return "approved";
    if (initialRejectedReason) return "rejected";
    if (initialUrl) return "pending";
    return "unsubmitted";
  };

  const [status, setStatus] = useState<Status>(derive());
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(status === "unsubmitted" || status === "rejected");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    setError(null);
    if (!file) {
      setPickedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!file.type.startsWith("video/")) {
      setError("Pick a video file (mp4, webm, mov, …).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Video must be under ${MAX_BYTES / (1024 * 1024)} MB.`);
      return;
    }

    // Duration check — happens after the browser reads metadata.
    const durationSeconds = await readVideoDuration(file);
    if (durationSeconds != null && durationSeconds > MAX_SECONDS) {
      setError(
        `Video is ${durationSeconds.toFixed(1)}s — trim it to ${MAX_SECONDS}s or less. Aim for around 15 seconds.`,
      );
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPickedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pickedFile) {
      setError("Pick a video first.");
      return;
    }
    setSubmitting(true);

    const supabase = createClient();

    // Read the client-side JWT — must match auth.uid() in storage RLS
    const {
      data: { user: authUser },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !authUser) {
      setError("Your session expired. Sign in again, then try uploading.");
      setSubmitting(false);
      return;
    }

    const ext = pickedFile.name.split(".").pop()?.toLowerCase() ?? "mp4";
    const path = `${authUser.id}/skill_video/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("media")
      .upload(path, pickedFile, { contentType: pickedFile.type, upsert: true });

    if (uploadErr) {
      const friendly = /row-level security|policy|bucket/i.test(uploadErr.message)
        ? "Upload rejected by storage. Ask an admin to run migrations/006_nin_storage_and_admin_rls.sql on this Supabase project — the media bucket policies aren't installed."
        : `Upload failed: ${uploadErr.message}`;
      setError(friendly);
      setSubmitting(false);
      return;
    }

    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);

    const { error: writeErr } = await supabase
      .from("workers")
      .update({
        skill_video_url: pub.publicUrl,
        skill_video_submitted_at: new Date().toISOString(),
        skill_video_verified: false,
        skill_video_rejected_reason: null,
      })
      .eq("user_id", authUser.id);

    setSubmitting(false);
    if (writeErr) {
      setError(writeErr.message);
      return;
    }

    setStatus("pending");
    setShowForm(false);
    setPickedFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">Skill video (15 seconds)</h2>
          <p className="mt-1 text-sm text-gray-600">
            Show clients you really do the work — record a short clip on the tools.
            Verified videos unlock trust badges and rank you higher in search.
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      {status === "approved" && initialUrl && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">
            Your video was approved. ✓
          </div>
          <video
            src={initialUrl}
            controls
            playsInline
            className="w-full rounded-xl border border-gray-200 bg-black"
          />
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setError(null);
            }}
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            Replace with a new video
          </button>
        </div>
      )}

      {status === "pending" && !showForm && initialUrl && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Waiting on admin review. We&apos;ll notify you once approved.
            {initialSubmittedAt && (
              <span className="mt-1 block text-xs opacity-75">
                Submitted {new Date(initialSubmittedAt).toLocaleString("en-NG")}
              </span>
            )}
          </div>
          <video
            src={initialUrl}
            controls
            playsInline
            className="w-full rounded-xl border border-gray-200 bg-black"
          />
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setError(null);
            }}
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            Replace the video I submitted
          </button>
        </div>
      )}

      {status === "rejected" && !showForm && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <p className="font-semibold">Your video was rejected.</p>
            {initialRejectedReason && (
              <p className="mt-1 text-rose-700">Reason: {initialRejectedReason}</p>
            )}
            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                setError(null);
              }}
              className="btn-primary mt-3 !py-2 !text-xs"
            >
              Upload a new one
            </button>
          </div>
        </div>
      )}

      {(status === "unsubmitted" || showForm) && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="skill-video-file">
              Pick a video (max {MAX_SECONDS}s, {MAX_BYTES / (1024 * 1024)} MB)
            </label>
            <input
              ref={fileRef}
              id="skill-video-file"
              type="file"
              accept="video/*"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="input !py-2 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white file:hover:bg-brand-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              A quick clip of you doing the work. Verified within 24 hours.
            </p>
          </div>

          {previewUrl && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Preview</p>
              <video
                src={previewUrl}
                controls
                playsInline
                className="w-full rounded-xl border border-gray-200 bg-black"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {(status === "pending" || status === "rejected" || status === "approved") && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setPickedFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="btn-ghost"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !pickedFile}
            >
              {submitting ? "Uploading…" : "Submit for verification"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    unsubmitted: { label: "Not submitted", cls: "bg-gray-100 text-gray-700" },
    pending: { label: "Pending review", cls: "bg-amber-100 text-amber-800" },
    approved: { label: "✓ Verified", cls: "bg-brand-100 text-brand-800" },
    rejected: { label: "Rejected", cls: "bg-rose-100 text-rose-800" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${cls}`}>
      {label}
    </span>
  );
}

/**
 * Read a video's duration from a File using a temporary <video> element.
 * Returns null if the browser can't read the metadata (unusual codec, etc.),
 * in which case we skip the client-side check and rely on admin review.
 */
function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    let settled = false;
    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.src = "";
    };
    video.onloadedmetadata = () => {
      if (settled) return;
      settled = true;
      const s = Number.isFinite(video.duration) ? video.duration : null;
      cleanup();
      resolve(s);
    };
    video.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(null);
    };
    video.src = url;
    // Safety timeout — if metadata never loads, don't hang the form
    setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(null);
    }, 5000);
  });
}
