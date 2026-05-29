import Link from "next/link";
import { WorkerCard } from "@/components/worker-card";
import { CATEGORIES, WORKERS } from "@/lib/fixtures";

export default function ClientHomePage() {
  const available = WORKERS.filter((w) => w.is_available).slice(0, 4);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-brand-100">Client portal</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">What do you need fixed today?</h1>
            <p className="mt-2 max-w-xl text-brand-100">
              Post a job or browse verified workers near you. Average response time in Enugu: under 12 minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/client/post-job" className="btn-primary !bg-white !text-brand-700 hover:!bg-brand-50">
              Post a job
            </Link>
            <Link href="/client/workers" className="btn-secondary !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
              Browse workers
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Browse by category</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/client/workers?category=${encodeURIComponent(c.name)}`}
              className="card flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">{c.name}</span>
              <span className="text-brand-600">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-gray-900">Available right now near you</h2>
          <Link href="/client/workers" className="text-sm font-semibold text-brand-700 hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {available.map((w) => (
            <WorkerCard key={w.user_id} worker={w} />
          ))}
        </div>
      </section>
    </div>
  );
}
