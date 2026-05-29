"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, ENUGU_NEIGHBOURHOODS, WORKERS } from "@/lib/fixtures";
import { WorkerCard } from "@/components/worker-card";

export default function WorkersPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 md:px-8 text-gray-500">Loading workers…</div>}>
      <WorkersPageInner />
    </Suspense>
  );
}

function WorkersPageInner() {
  const params = useSearchParams();
  const initialCategory = params.get("category") ?? "All";

  const [category, setCategory] = useState<string>(initialCategory);
  const [radius, setRadius] = useState<number>(5);
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [neighbourhood, setNeighbourhood] = useState<string>("GRA");

  const filtered = useMemo(() => {
    return WORKERS.filter((w) => {
      if (category !== "All" && w.category !== category) return false;
      if (w.distance_km > radius) return false;
      if (availableOnly && !w.is_available) return false;
      if (verifiedOnly && !w.nin_verified) return false;
      return true;
    }).sort((a, b) => a.distance_km - b.distance_km);
  }, [category, radius, availableOnly, verifiedOnly]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">Find a worker</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Verified workers near {neighbourhood}
          </h1>
          <p className="mt-1 text-gray-600">
            {filtered.length} match{filtered.length === 1 ? "" : "es"} within {radius} km · sorted by distance
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="card h-fit">
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>

          <div className="mt-4">
            <label className="label">Pinned neighbourhood</label>
            <select
              value={neighbourhood}
              onChange={(e) => setNeighbourhood(e.target.value)}
              className="input"
            >
              {ENUGU_NEIGHBOURHOODS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              In the live app, this comes from a map pin.
            </p>
          </div>

          <div className="mt-4">
            <label className="label">Radius — {radius} km</label>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>1 km</span>
              <span>5 km</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("All")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  category === "All"
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.name)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    category === c.name
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded accent-brand-600"
              />
              Available now
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 rounded accent-brand-600"
              />
              NIN-verified only
            </label>
          </div>
        </aside>

        <section>
          {filtered.length === 0 ? (
            <div className="card text-center text-gray-600">
              <p className="text-base font-semibold text-gray-900">No workers match.</p>
              <p className="mt-1 text-sm">Try widening your radius or clearing filters.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((w) => (
                <WorkerCard key={w.user_id} worker={w} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
