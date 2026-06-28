import Link from "next/link";
import { notFound } from "next/navigation";
import { WORKERS, formatNaira } from "@/lib/fixtures";
import { Avatar } from "@/components/avatar";

export default function WorkerDetailPage({ params }: { params: { id: string } }) {
  const worker = WORKERS.find((w) => w.user_id === params.id);
  if (!worker) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <Link href="/client/workers" className="text-sm text-brand-700 hover:underline">
        ← Back to workers
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="flex items-start gap-5">
            <Avatar url={worker.photo_url} name={worker.full_name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{worker.full_name}</h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    worker.is_available ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      worker.is_available ? "bg-brand-500" : "bg-gray-400"
                    }`}
                  />
                  {worker.is_available ? "Available now" : "Offline"}
                </span>
              </div>
              <p className="text-gray-600">{worker.category}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="font-medium text-amber-600">★ {worker.rating.toFixed(1)}</span>
                <span>{worker.jobs_completed} jobs completed</span>
                <span>· {worker.distance_km.toFixed(1)} km away</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {worker.nin_verified && <span className="chip-brand">✓ NIN verified</span>}
                {worker.has_skill_video && <span className="chip">📹 Skill video on file</span>}
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-100" />

          <section>
            <h2 className="text-sm font-semibold text-gray-900">About</h2>
            <p className="mt-2 text-gray-700">{worker.bio}</p>
          </section>

          <section className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {worker.skills.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900">Skill video</h2>
            {worker.has_skill_video ? (
              <div className="mt-2 grid aspect-video place-items-center rounded-xl bg-gray-900 text-white/80">
                <div className="text-center">
                  <div className="text-3xl">▶</div>
                  <p className="mt-2 text-sm">15-second skill clip · verified on upload</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No video uploaded yet.</p>
            )}
          </section>

          <section className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900">Recent reviews</h2>
            <ul className="mt-2 space-y-3">
              {[
                {
                  name: "Onyeka E.",
                  rating: 5,
                  body: "On time, polite, fixed the tank issue in 30 minutes. Will book again.",
                  when: "2 days ago",
                },
                {
                  name: "Chidi U.",
                  rating: 5,
                  body: "Great work and fair pricing. Very respectful in the home.",
                  when: "1 week ago",
                },
                {
                  name: "Henry C.",
                  rating: 4,
                  body: "Did the job well. Took a bit longer than expected.",
                  when: "3 weeks ago",
                },
              ].map((r) => (
                <li key={r.body} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                    <span className="text-xs text-gray-500">{r.when}</span>
                  </div>
                  <p className="mt-1 text-sm text-amber-600">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  <p className="mt-1 text-sm text-gray-700">{r.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card sticky top-20">
            <p className="text-sm text-gray-500">Hourly rate</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{formatNaira(worker.hourly_rate)}</p>
            <p className="text-xs text-gray-500">no travel fees added</p>

            <hr className="my-4 border-gray-100" />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Distance</dt>
                <dd className="font-medium text-gray-900">{worker.distance_km.toFixed(1)} km</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">First-hour estimate</dt>
                <dd className="font-bold text-gray-900">{formatNaira(worker.hourly_rate)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-gray-500">
              Worker is within Sure Hands&apos; matching radius — no extra travel cost.
            </p>

            <div className="mt-5 space-y-2">
              <Link href="/client/post-job" className="btn-primary w-full">Hire {worker.full_name.split(" ")[0]}</Link>
              <button className="btn-secondary w-full">📞 Request a call</button>
            </div>
            <p className="mt-3 text-center text-xs text-gray-500">
              Cash on completion in Phase 1. Escrow rolls out in Phase 2.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
