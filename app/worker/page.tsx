"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JOBS, formatNaira } from "@/lib/fixtures";
import { JobCard } from "@/components/job-card";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";

type Me = {
  full_name: string | null;
  avatar_url: string | null;
  first_name: string;
};

type Stats = {
  earningsThisWeek: number;
  completedThisWeek: number;
  rating: number | null;
  reviewsCount: number;
};

const EMPTY_STATS: Stats = {
  earningsThisWeek: 0,
  completedThisWeek: 0,
  rating: null,
  reviewsCount: 0,
};

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function WorkerHomePage() {
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasWorkerRow, setHasWorkerRow] = useState<boolean>(false);
  const [me, setMe] = useState<Me | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);

  const nearby = JOBS.slice(0, 3); // still fixtures — replaced when jobs get created live

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Profile → name + avatar for the greeting
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      // Worker row → current availability (also tells us if a worker row exists)
      const { data: workerRow } = await supabase
        .from("workers")
        .select("is_available")
        .eq("user_id", user.id)
        .maybeSingle();

      // Real stats: bookings completed this week + earnings + weighted rating
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoIso = weekAgo.toISOString();

      const { data: completedThisWeek } = await supabase
        .from("bookings")
        .select("agreed_price, completed_at")
        .eq("worker_user_id", user.id)
        .eq("status", "completed")
        .gte("completed_at", weekAgoIso);

      const { data: agg } = await supabase
        .from("worker_review_aggregate")
        .select("weighted_avg_stars, reviews_count")
        .eq("worker_user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const fullName = profile?.full_name ?? user.email ?? null;
      const firstName = (fullName ?? "there").trim().split(/\s+/)[0];

      setMe({
        full_name: fullName,
        avatar_url: profile?.avatar_url ?? null,
        first_name: firstName,
      });

      if (workerRow) {
        setHasWorkerRow(true);
        setAvailable(!!workerRow.is_available);
      } else {
        setHasWorkerRow(false);
      }

      const earnings = (completedThisWeek ?? []).reduce(
        (sum, b: { agreed_price: number }) => sum + (b.agreed_price ?? 0),
        0,
      );
      setStats({
        earningsThisWeek: earnings,
        completedThisWeek: completedThisWeek?.length ?? 0,
        rating: agg?.weighted_avg_stars ?? null,
        reviewsCount: agg?.reviews_count ?? 0,
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle() {
    setError(null);
    const next = !available;
    setAvailable(next);
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error: writeErr } = await supabase
      .from("workers")
      .update({ is_available: next })
      .eq("user_id", user.id);

    setSaving(false);

    if (writeErr) {
      setAvailable(!next);
      setError(
        hasWorkerRow
          ? writeErr.message
          : "Finish your worker onboarding before setting availability.",
      );
      return;
    }
    setSavedAt(new Date());
  }

  const greeting = greetingFor(new Date().getHours());
  const displayName = me?.first_name ?? "there";

  // Load the current availability from the workers row (if it exists).
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error: loadErr } = await supabase
        .from("workers")
        .select("is_available")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (loadErr) return; // Silent — page still works with local state
      if (data) {
        setHasWorkerRow(true);
        setAvailable(!!data.is_available);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle() {
    setError(null);
    const next = !available;
    setAvailable(next); // Optimistic
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return; // Not signed in — local state only
    }

    const { error: writeErr } = await supabase
      .from("workers")
      .update({ is_available: next })
      .eq("user_id", user.id);

    setSaving(false);

    if (writeErr) {
      setAvailable(!next); // Revert
      setError(
        hasWorkerRow
          ? writeErr.message
          : "Complete your worker profile first before setting availability.",
      );
      return;
    }
    setSavedAt(new Date());
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-soft sm:rounded-3xl sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex items-start gap-4">
            {me && <Avatar url={me.avatar_url} name={me.full_name} size="lg" />}
            <div className="min-w-0">
              <p className="text-brand-100">Worker portal</p>
              <h1 className="mt-2 break-words text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                {greeting}, {displayName} 👋
              </h1>
              <p className="mt-2 max-w-xl text-sm text-brand-100 sm:text-base">
                {hasWorkerRow
                  ? "Turn yourself on to start receiving requests."
                  : "Your worker profile is pending — an admin will approve you shortly."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur sm:justify-start">
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-100">Status</p>
              <p className="text-lg font-bold">{available ? "Available now" : "Offline"}</p>
              {saving && <p className="text-[11px] text-brand-100/80">saving…</p>}
              {savedAt && !saving && (
                <p className="text-[11px] text-brand-100/80">saved · {savedAt.toLocaleTimeString()}</p>
              )}
              {error && <p className="mt-1 text-[11px] text-rose-200">{error}</p>}
            </div>
            <button
              onClick={toggle}
              disabled={saving || !hasWorkerRow}
              aria-pressed={available}
              className={`relative h-10 w-20 rounded-full transition disabled:opacity-70 ${
                available ? "bg-brand-400" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-bold text-brand-700 transition-all ${
                  available ? "left-11" : "left-1"
                }`}
              >
                {available ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-gray-500">This week&apos;s earnings</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {formatNaira(stats.earningsThisWeek)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {stats.earningsThisWeek === 0
              ? "No completed jobs this week yet."
              : "Sum of agreed prices for jobs marked complete."}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Jobs completed</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.completedThisWeek}</p>
          <p className="mt-1 text-xs text-gray-500">this week</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Rating</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">
            {stats.rating != null ? `★ ${Number(stats.rating).toFixed(1)}` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {stats.reviewsCount === 0
              ? "No reviews yet"
              : `${stats.reviewsCount} review${stats.reviewsCount === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-gray-900">Jobs near you</h2>
          <Link href="/worker/jobs" className="text-sm font-semibold text-brand-700 hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nearby.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Showing seed data until real jobs are posted in your area.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Link href="/worker/profile" className="card hover:bg-brand-50">
          <h3 className="font-semibold text-gray-900">Boost your profile</h3>
          <p className="mt-1 text-sm text-gray-600">Workers with skill videos get 3x more requests.</p>
          <p className="mt-3 text-sm font-semibold text-brand-700">Update profile →</p>
        </Link>
        <Link href="/worker/interests" className="card hover:bg-brand-50">
          <h3 className="font-semibold text-gray-900">Your active proposals</h3>
          <p className="mt-1 text-sm text-gray-600">Track every job you&apos;ve applied to in one place.</p>
          <p className="mt-3 text-sm font-semibold text-brand-700">My interests →</p>
        </Link>
        <Link href="/worker/jobs" className="card hover:bg-brand-50">
          <h3 className="font-semibold text-gray-900">Find more jobs</h3>
          <p className="mt-1 text-sm text-gray-600">Filter by category, distance, and budget.</p>
          <p className="mt-3 text-sm font-semibold text-brand-700">Browse jobs →</p>
        </Link>
      </section>
    </div>
  );
}
