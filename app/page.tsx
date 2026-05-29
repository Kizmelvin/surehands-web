import Link from "next/link";
import { CATEGORIES, WORKERS } from "@/lib/fixtures";
import { WorkerCard } from "@/components/worker-card";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-stone-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="chip-brand w-fit">Launching in Enugu · Now in beta</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Verified hands. <span className="text-brand-600">Nearby.</span> Now.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-gray-600">
              Sure Hands connects you to NIN-verified plumbers, electricians, cleaners, and mechanics within a
              1–5 km radius. Transparent transport fees. No more wasted hours hunting for a trusted artisan.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/client/post-job" className="btn-primary">Post a job →</Link>
              <Link href="/client/workers" className="btn-secondary">Browse workers</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-700">✓</span>
                NIN verified
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-700">📹</span>
                15-second skill video
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-700">📍</span>
                Geo-matched
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-brand-100 blur-2xl" />
            <div className="absolute -right-6 -bottom-6 h-40 w-40 rounded-full bg-accent-orange/20 blur-3xl" />
            <div className="relative rounded-3xl border border-gray-200 bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Workers near GRA, Enugu</p>
                <span className="chip">5 km radius</span>
              </div>
              <div className="space-y-3">
                {WORKERS.slice(0, 3).map((w) => (
                  <WorkerCard key={w.user_id} worker={w} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">How Sure Hands works</h2>
          <p className="mt-3 text-gray-600">
            A two-sided marketplace built for two real problems: trust and proximity.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "Post or browse",
              body: "Clients describe a job and drop a pin. Workers see jobs that match their skill and are nearby."
            },
            {
              n: "2",
              title: "Match & price",
              body: "Our matching engine surfaces workers in a 1–5 km radius. Transport surcharge is shown up front."
            },
            {
              n: "3",
              title: "Hire & rate",
              body: "Cash on completion in Phase 1. After the job, leave a star rating that helps the next client."
            },
          ].map((step) => (
            <div key={step.n} className="card">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-base font-bold text-white">
                {step.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="trust" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <span className="chip-brand">Trust is the product</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                Every worker is vetted before they appear in your search.
              </h2>
              <p className="mt-4 text-gray-600">
                Informal labor in Nigeria has historically been a referral chain. We are formalizing it with
                identity verification, video proof, and recency-weighted reviews — so trust travels with the
                worker, not the contact.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                {
                  t: "Mandatory NIN verification",
                  b: "Every worker submits and matches their National Identification Number before activation."
                },
                {
                  t: "15-second skill video",
                  b: "Workers record a short on-the-tools clip so clients see real skill, not just a stock profile."
                },
                {
                  t: "Recency-weighted 5-star reviews",
                  b: "Recent jobs count more than old ones. Quality control compounds over time."
                },
                {
                  t: "Geofenced operations",
                  b: "We onboard region by region, so support, SLA timers, and surcharge math are tuned per city."
                },
              ].map((item) => (
                <li key={item.t} className="card flex items-start gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.t}</p>
                    <p className="text-sm text-gray-600">{item.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Popular categories</h2>
            <p className="mt-2 text-gray-600">Tap a category to browse verified workers nearby.</p>
          </div>
          <Link href="/client/workers" className="btn-secondary hidden sm:inline-flex">All workers</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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

      <section className="bg-brand-700">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 text-white md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="text-2xl font-bold">Are you skilled with your hands?</h2>
            <p className="mt-2 text-brand-100">
              Build a verified profile, set your availability, and get matched with jobs in your neighborhood.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/worker/profile" className="btn-secondary !border-white !bg-white !text-brand-700">
              Build my profile
            </Link>
            <Link href="/worker/jobs" className="btn-primary !bg-brand-900 hover:!bg-brand-800">
              See open jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
