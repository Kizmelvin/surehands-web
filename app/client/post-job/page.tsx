"use client";

import { useState } from "react";
import { CATEGORIES, ENUGU_NEIGHBOURHOODS } from "@/lib/fixtures";

export default function PostJobPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [neighbourhood, setNeighbourhood] = useState("GRA");
  const [budget, setBudget] = useState<number>(15000);
  const [urgency, setUrgency] = useState<"asap" | "today" | "this_week">("today");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-8">
        <div className="card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-2xl text-brand-700">✓</div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Job posted!</h1>
          <p className="mt-2 text-gray-600">
            We&apos;re notifying verified workers in a 5 km radius. You&apos;ll see proposals come in within minutes.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="/client" className="btn-secondary">Back to dashboard</a>
            <a href="/client/workers" className="btn-primary">Browse workers too</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Client portal</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Post a job</h1>
        <p className="mt-1 text-gray-600">Describe the work. We notify nearby verified workers within minutes.</p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]"
      >
        <div className="card space-y-5">
          <div>
            <label className="label" htmlFor="title">What do you need?</label>
            <input
              id="title"
              required
              placeholder="e.g. Kitchen sink leaking under cabinet"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="description">Describe the job</label>
            <textarea
              id="description"
              required
              rows={5}
              placeholder="The more detail you give, the better the matches and quotes."
              className="input resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Neighbourhood</label>
              <select
                className="input"
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
              >
                {ENUGU_NEIGHBOURHOODS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">In the live app, you&apos;ll drop a map pin.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Your budget (₦)</label>
              <input
                type="number"
                min={1000}
                step={500}
                className="input"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">Workers may quote above or below.</p>
            </div>
            <div>
              <label className="label">Urgency</label>
              <div className="flex gap-2">
                {(
                  [
                    { v: "asap", l: "ASAP" },
                    { v: "today", l: "Today" },
                    { v: "this_week", l: "This week" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setUrgency(opt.v)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${
                      urgency === opt.v
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost">Save draft</button>
            <button type="submit" className="btn-primary" disabled={!title || !description}>
              Publish job
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900">What happens next</h2>
            <ol className="mt-3 space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">1</span>
                <span>We notify <strong>NIN-verified workers</strong> within a 5 km radius matching the category.</span>
              </li>
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">2</span>
                <span>You review proposals — quotes, ratings, distance, skill video.</span>
              </li>
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">3</span>
                <span>You accept, the worker heads over, you confirm completion. Cash on delivery in Phase 1.</span>
              </li>
            </ol>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900">No travel surcharges</h2>
            <p className="mt-2 text-xs text-gray-600">
              We only show your job to workers inside our matching radius (typically 1–5 km). What a worker
              quotes is what you pay — no surprise distance fees.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
