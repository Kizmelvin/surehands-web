import Link from "next/link";
import type { JobCard as JobCardType } from "@/types/db";
import { formatNaira, timeAgo } from "@/lib/fixtures";

export function JobCard({ job, hrefBase = "/worker/jobs" }: { job: JobCardType; hrefBase?: string }) {
  return (
    <Link href={`${hrefBase}/${job.id}`} className="card group block">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="chip-brand">{job.category}</span>
            <span className="text-xs text-gray-500">{timeAgo(job.posted_at)}</span>
          </div>
          <h3 className="mt-2 truncate text-base font-semibold text-gray-900 group-hover:text-brand-700">
            {job.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{job.description}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">{formatNaira(job.budget)}</p>
          <p className="text-xs text-gray-500">client budget</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path
              d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
          </svg>
          {job.location_label}
        </span>
        <span>· {job.distance_km.toFixed(1)} km</span>
        <span>· {job.proposals_count} proposals</span>
      </div>
    </Link>
  );
}
