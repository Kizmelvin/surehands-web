import Link from "next/link";
import type { WorkerCard as WorkerCardType } from "@/types/db";
import { formatNaira } from "@/lib/fixtures";
import { Avatar } from "./avatar";

export function WorkerCard({ worker }: { worker: WorkerCardType }) {
  return (
    <Link href={`/client/workers/${worker.user_id}`} className="card group block">
      <div className="flex items-start gap-4">
        <Avatar url={worker.photo_url} name={worker.full_name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900 group-hover:text-brand-700">
              {worker.full_name}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${
                worker.is_available
                  ? "bg-brand-100 text-brand-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  worker.is_available ? "bg-brand-500" : "bg-gray-400"
                }`}
              />
              {worker.is_available ? "Available" : "Offline"}
            </span>
          </div>
          <p className="text-sm text-gray-600">{worker.category}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1 font-medium text-amber-600">
              ★ {worker.rating.toFixed(1)}
              <span className="text-gray-500">({worker.jobs_completed} jobs)</span>
            </span>
            <span>· {worker.distance_km.toFixed(1)} km away</span>
            <span>· {formatNaira(worker.hourly_rate)}/hr</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {worker.nin_verified && (
              <span className="chip-brand">
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                  <path
                    d="M5 12l4 4L19 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                NIN verified
              </span>
            )}
            {worker.has_skill_video && <span className="chip">📹 Video on file</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
