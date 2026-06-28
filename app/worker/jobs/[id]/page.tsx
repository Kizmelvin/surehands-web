"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { JOBS, formatNaira, timeAgo } from "@/lib/fixtures";

export default function WorkerJobDetailPage() {
  const params = useParams<{ id: string }>();
  const job = JOBS.find((j) => j.id === params?.id);
  if (!job) notFound();

  const [quote, setQuote] = useState(job.budget);
  const [message, setMessage] = useState(
    "I can be there in under an hour with all tools. Quoting fairly based on what you described."
  );
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <Link href="/worker/jobs" className="text-sm text-brand-700 hover:underline">
        ← Back to jobs
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="chip-brand">{job.category}</span>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Posted {timeAgo(job.posted_at)} · {job.location_label} · {job.distance_km.toFixed(1)} km from you
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {job.status.toUpperCase()}
            </span>
          </div>

          <p className="mt-4 text-gray-700">{job.description}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Client budget</p>
              <p className="text-lg font-bold text-gray-900">{formatNaira(job.budget)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Distance from you</p>
              <p className="text-lg font-bold text-gray-900">{job.distance_km.toFixed(1)} km</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Open proposals</p>
              <p className="text-lg font-bold text-gray-900">{job.proposals_count}</p>
            </div>
          </div>

          <hr className="my-6 border-gray-100" />

          {submitted ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center">
              <p className="text-3xl">✓</p>
              <p className="mt-2 font-semibold text-brand-800">Proposal submitted.</p>
              <p className="mt-1 text-sm text-brand-700">
                You&apos;ll get a notification when the client responds.
              </p>
              <Link href="/worker/interests" className="btn-primary mt-4 inline-flex">
                Track in my interests
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <h2 className="text-base font-semibold text-gray-900">Submit a proposal</h2>
              <p className="text-sm text-gray-600">
                Quote the full price you&apos;ll charge for the job. Only apply to jobs close enough that travel
                isn&apos;t a hassle.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Your quote (₦)</label>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    className="input"
                    value={quote}
                    onChange={(e) => setQuote(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">ETA</label>
                  <select className="input">
                    <option>Within 30 minutes</option>
                    <option>Within 1 hour</option>
                    <option>Today</option>
                    <option>Tomorrow</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="label">Message to the client</label>
                <textarea
                  className="input resize-y"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <Link href="/worker/jobs" className="btn-ghost">Pass</Link>
                <button type="submit" className="btn-primary">Send proposal</button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900">Total client will see</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Your quote</dt>
                <dd className="font-bold text-gray-900">{formatNaira(quote)}</dd>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <dt>Distance from you</dt>
                <dd>{job.distance_km.toFixed(1)} km</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-gray-500">
              No transport surcharge — Sure Hands only shows you jobs within your travel radius.
            </p>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900">Client</h2>
            <p className="mt-2 text-sm text-gray-700">{job.client_name}</p>
            <p className="text-xs text-gray-500">Member since Apr 2026 · 4 jobs posted</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
