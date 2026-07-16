"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";

export type AdminWorkerRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  operating_city: string | null;
  nin_verified: boolean;
  verification_status: string;
  is_visible: boolean;
  is_available: boolean;
  has_skill_video: boolean;
  created_at: string;
};

export function WorkerRow({ row }: { row: AdminWorkerRow }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(row.is_visible);
  const [isAvailable, setIsAvailable] = useState(row.is_available);

  async function toggle(field: "is_visible" | "is_available", next: boolean) {
    setError(null);
    if (field === "is_visible") setIsVisible(next);
    if (field === "is_available") setIsAvailable(next);

    const supabase = createClient();
    const { error: err } = await supabase
      .from("workers")
      .update({ [field]: next })
      .eq("user_id", row.user_id);

    if (err) {
      setError(err.message);
      // Revert optimistic update
      if (field === "is_visible") setIsVisible(!next);
      if (field === "is_available") setIsAvailable(!next);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <li className="card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar url={row.avatar_url} name={row.full_name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {row.full_name ?? "Unnamed"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {row.email ?? "no email"} · {row.operating_city ?? "no city"}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <StatusPill
                label={row.verification_status.toUpperCase()}
                tone={
                  row.verification_status === "approved"
                    ? "green"
                    : row.verification_status === "rejected"
                      ? "red"
                      : "amber"
                }
              />
              {row.nin_verified && <StatusPill label="NIN ✓" tone="green" />}
              {row.has_skill_video && <StatusPill label="Video ✓" tone="green" />}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4 text-xs">
          <Toggle
            label="Visible"
            checked={isVisible}
            disabled={busy}
            onChange={(v) => toggle("is_visible", v)}
          />
          <Toggle
            label="Available"
            checked={isAvailable}
            disabled={busy}
            onChange={(v) => toggle("is_available", v)}
          />
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </li>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "red" | "amber" }) {
  const cls =
    tone === "green"
      ? "bg-brand-100 text-brand-700"
      : tone === "red"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-gray-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-brand-600" : "bg-gray-300"} disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
