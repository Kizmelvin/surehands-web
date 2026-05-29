"use client";

import Link from "next/link";
import { useState } from "react";
import { JOBS, formatNaira } from "@/lib/fixtures";
import { JobCard } from "@/components/job-card";

export default function WorkerHomePage() {
  const [available, setAvailable] = useState(true);
  const nearby = JOBS.slice(0, 3);

  const earningsThisWeek = 47500;
  const completedThisWeek = 6;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-brand-100">Worker portal</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Good morning, Chibuzo 👋</h1>
            <p className="mt-2 max-w-xl text-brand-100">
              You have 12 nearby jobs in your category. Turn yourself on to start receiving requests.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-100">Status</p>
              <p className="text-lg font-bold">{available ? "Available now" : "Offline"}</p>
            </div>
            <button
              onClick={() => setAvailable((s) => !s)}
              aria-pressed={available}
              className={`relative h-10 w-20 rounded-full transition ${
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
          <p className="mt-1 text-3xl font-bold text-gray-900">{formatNaira(earningsThisWeek)}</p>
          <p className="mt-1 text-xs text-brand-700">+18% vs last week</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Jobs completed</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{completedThisWeek}</p>
          <p className="mt-1 text-xs text-gray-500">this week</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Rating</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">★ 4.9</p>
          <p className="mt-1 text-xs text-gray-500">87 reviews</p>
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
