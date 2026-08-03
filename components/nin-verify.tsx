"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "unsubmitted" | "pending" | "approved" | "rejected";

type Props = {
  userId: string;
  initialNin: string | null;
  initialSubmittedAt: string | null;
  initialVerified: boolean;
  initialRejectedReason: string | null;
};

/**
 * Small self-contained card users open from /account to submit their NIN.
 *
 * Status derivation (mirrors what the admin sees in /admin/kyc):
 *  - approved   => nin_verified = true
 *  - rejected   => nin_verified = false AND nin_rejected_reason is set
 *  - pending    => nin_submitted is set, awaiting admin review
 *  - unsubmitted => nothing submitted yet
 */
export function NinVerify({
  userId,
  initialNin,
  initialSubmittedAt,
  initialVerified,
  initialRejectedReason,
}: Props) {
  const router = useRouter();

  const derive = (): Status => {
    if (initialVerified) return "approved";
    if (initialRejectedReason) return "rejected";
    if (initialNin) return "pending";
    return "unsubmitted";
  };

  const [status, setStatus] = useState<Status>(derive());
  const [nin, setNin] = useState<string>(initialNin ?? "");
  const [showForm, setShowForm] = useState<boolean>(status !== "approved" && status !== "pending");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onNinChange(v: string) {
    setNin(v.replace(/\D/g, "").slice(0, 11));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (nin.length !== 11) {
      setError("NIN must be exactly 11 digits.");
      return;
    }
    setSubmitting(true);

    const supabase = createClient();
    const { error: writeErr } = await supabase
      .from("profiles")
      .update({
        nin_submitted: nin,
        nin_submitted_at: new Date().toISOString(),
        nin_rejected_reason: null,
        nin_verified: false,
      })
      .eq("id", userId);

    setSubmitting(false);
    if (writeErr) {
      setError(writeErr.message);
      return;
    }
    setStatus("pending");
    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">National ID (NIN)</h2>
          <p className="mt-1 text-sm text-gray-600">
            Verifying your NIN unlocks trust badges and gets you higher in search
            results.
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      {status === "approved" && (
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">
          Your NIN was approved by our team. ✓
        </div>
      )}

      {status === "pending" && !showForm && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Waiting on admin review. We&apos;ll notify you once approved.
          {initialSubmittedAt && (
            <span className="mt-1 block text-xs opacity-75">
              Submitted {new Date(initialSubmittedAt).toLocaleString("en-NG")}
            </span>
          )}
        </div>
      )}

      {status === "rejected" && !showForm && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">Your NIN was rejected.</p>
          {initialRejectedReason && (
            <p className="mt-1 text-rose-700">Reason: {initialRejectedReason}</p>
          )}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-3 btn-primary !py-2 !text-xs"
          >
            Try again
          </button>
        </div>
      )}

      {(status === "unsubmitted" || (showForm && status !== "approved")) && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="nin-input">
              Your 11-digit NIN
            </label>
            <input
              id="nin-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              required
              className="input text-center text-lg tracking-[0.4em]"
              value={nin}
              onChange={(e) => onNinChange(e.target.value)}
              placeholder="•••••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">
              {nin.length}/11 digits. Numbers only.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {(status === "pending" || status === "rejected") && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setNin(initialNin ?? "");
                }}
                className="btn-ghost"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || nin.length !== 11}
            >
              {submitting ? "Submitting…" : "Submit for verification"}
            </button>
          </div>
        </form>
      )}

      {status === "pending" && !showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-4 text-xs font-medium text-brand-700 hover:underline"
        >
          Change the NIN I submitted
        </button>
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
