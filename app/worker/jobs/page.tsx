"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, JOBS } from "@/lib/fixtures";
import { JobCard } from "@/components/job-card";

type Tab = "for_you" | "all" | "recent";

export default function WorkerJobsPage() {
  const [tab, setTab] = useState<Tab>("for_you");
  const [category, setCategory] = useState("All");
  const [maxKm, setMaxKm] = useState(5);
  const [minBudget, setMinBudget] = useState(0);

  const myCategory = "Plumbing";

  const filtered = useMemo(() => {
    let pool = [...JOBS];
    if (tab === "for_you") pool = pool.filter((j) => j.category === myCategory);
    if (tab === "recent") pool = pool.sort((a, b) => b.posted_at.localeCompare(a.posted_at));
    if (category !== "All") pool = pool.filter((j) => j.category === category);
    pool = pool.filter((j) => j.distance_km <= maxKm);
    pool = pool.filter((j) => j.budget >= minBudget);
    return pool;
  }, [tab, category, maxKm, minBudget]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Worker portal</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Find jobs nearby</h1>
        <p className="mt-1 text-gray-600">Geo-matched to your base location. Apply once — clients see your full profile.</p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          { v: "for_you", l: "For you" },
          { v: "all", l: "All categories" },
          { v: "recent", l: "Most recent" },
        ] as const).map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              tab === t.v
                ? "bg-brand-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="card h-fit">
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>

          <div className="mt-4">
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All</option>
              {CATEGORIES.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="label">Within — {maxKm} km</label>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={maxKm}
              onChange={(e) => setMaxKm(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>

          <div className="mt-4">
            <label className="label">Min budget (₦)</label>
            <input
              type="number"
              className="input"
              value={minBudget}
              min={0}
              step={1000}
              onChange={(e) => setMinBudget(Number(e.target.value))}
            />
          </div>
        </aside>

        <section>
          <p className="mb-3 text-sm text-gray-600">
            {filtered.length} job{filtered.length === 1 ? "" : "s"} found
          </p>
          {filtered.length === 0 ? (
            <div className="card text-center text-gray-600">
              <p className="text-base font-semibold text-gray-900">No jobs match right now.</p>
              <p className="mt-1 text-sm">Try widening your radius or lowering the budget floor.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
