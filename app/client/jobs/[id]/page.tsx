import Link from "next/link";
import { notFound } from "next/navigation";
import { JOBS, WORKERS, formatNaira, timeAgo, transportSurcharge } from "@/lib/fixtures";
import { Avatar } from "@/components/avatar";

export default function ClientJobDetailPage({ params }: { params: { id: string } }) {
  const job = JOBS.find((j) => j.id === params.id);
  if (!job) notFound();

  const proposals = WORKERS.filter((w) => w.category === job.category).slice(0, 4).map((w) => ({
    worker: w,
    quoted: Math.round(job.budget * (0.9 + Math.random() * 0.25)),
    message:
      "I have done similar work in your area many times. Can be there in under an hour with all tools. Quoting fairly.",
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <Link href="/client" className="text-sm text-brand-700 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="chip-brand">{job.category}</span>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="mt-1 text-sm text-gray-500">Posted {timeAgo(job.posted_at)} · {job.location_label}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {job.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-4 text-gray-700">{job.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span>Budget <strong className="text-gray-900">{formatNaira(job.budget)}</strong></span>
              <span>· {job.proposals_count} proposals</span>
              <span>· {job.distance_km.toFixed(1)} km from your pin</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">Proposals ({proposals.length})</h2>
            <p className="text-sm text-gray-600">Sorted by best match. Distance and rating weighted equally.</p>

            <ul className="mt-4 space-y-3">
              {proposals.map(({ worker, quoted, message }) => {
                const surcharge = transportSurcharge(worker.distance_km);
                return (
                  <li key={worker.user_id} className="card">
                    <div className="flex items-start gap-4">
                      <Avatar url={worker.photo_url} name={worker.full_name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/client/workers/${worker.user_id}`}
                            className="truncate font-semibold text-gray-900 hover:text-brand-700"
                          >
                            {worker.full_name}
                          </Link>
                          <span className="text-lg font-bold text-gray-900">{formatNaira(quoted)}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          ★ {worker.rating.toFixed(1)} · {worker.jobs_completed} jobs · {worker.distance_km.toFixed(1)} km away · +{formatNaira(surcharge)} transport
                        </p>
                        <p className="mt-2 text-sm text-gray-700">{message}</p>
                        <div className="mt-3 flex gap-2">
                          <button className="btn-primary !py-2 !text-xs">Accept</button>
                          <button className="btn-secondary !py-2 !text-xs">Message</button>
                          <button className="btn-ghost !py-2 !text-xs">Pass</button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900">Job status</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {["Requested", "Accepted", "En route", "In progress", "Completed"].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                      i === 0 ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={i === 0 ? "font-semibold text-gray-900" : "text-gray-500"}>{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-gray-500">
              The booking lifecycle activates once you accept a proposal.
            </p>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900">Need to change something?</h2>
            <div className="mt-3 space-y-2">
              <button className="btn-secondary w-full">Edit job</button>
              <button className="btn-ghost w-full text-rose-600 hover:bg-rose-50">Cancel job</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
