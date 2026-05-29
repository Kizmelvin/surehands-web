import Link from "next/link";
import { JOBS, formatNaira, timeAgo } from "@/lib/fixtures";

type InterestStatus = "submitted" | "accepted" | "rejected" | "withdrawn";

const interests: Array<{
  job_id: string;
  quoted: number;
  status: InterestStatus;
  applied_at: string;
}> = [
  { job_id: "j-1", quoted: 13000, status: "submitted", applied_at: "2026-05-28T09:30:00Z" },
  { job_id: "j-3", quoted: 18000, status: "accepted", applied_at: "2026-05-27T19:00:00Z" },
  { job_id: "j-4", quoted: 7500, status: "rejected", applied_at: "2026-05-28T11:50:00Z" },
  { job_id: "j-5", quoted: 92000, status: "withdrawn", applied_at: "2026-05-26T16:10:00Z" },
];

const statusStyle: Record<InterestStatus, string> = {
  submitted: "bg-amber-100 text-amber-800",
  accepted: "bg-brand-100 text-brand-800",
  rejected: "bg-rose-100 text-rose-800",
  withdrawn: "bg-gray-100 text-gray-600",
};

export default function WorkerInterestsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Worker portal</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My interests</h1>
        <p className="mt-1 text-gray-600">Every job you&apos;ve applied to. Track replies and follow up.</p>
      </header>

      <ul className="mt-8 space-y-3">
        {interests.map((i) => {
          const job = JOBS.find((j) => j.id === i.job_id);
          if (!job) return null;
          return (
            <li key={i.job_id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip-brand">{job.category}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[i.status]}`}>
                      {i.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">applied {timeAgo(i.applied_at)}</span>
                  </div>
                  <Link
                    href={`/worker/jobs/${job.id}`}
                    className="mt-2 block truncate text-base font-semibold text-gray-900 hover:text-brand-700"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-1 text-xs text-gray-500">
                    {job.location_label} · {job.distance_km.toFixed(1)} km away
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">your quote</p>
                  <p className="text-lg font-bold text-gray-900">{formatNaira(i.quoted)}</p>
                </div>
              </div>
              {i.status === "accepted" && (
                <div className="mt-4 flex gap-2">
                  <button className="btn-primary !py-2 !text-xs">Mark en route</button>
                  <button className="btn-secondary !py-2 !text-xs">Message client</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {interests.length === 0 && (
        <div className="card mt-6 text-center text-gray-600">
          <p className="text-base font-semibold text-gray-900">You haven&apos;t applied to any jobs yet.</p>
          <Link href="/worker/jobs" className="btn-primary mt-4 inline-flex">Browse jobs</Link>
        </div>
      )}
    </div>
  );
}
