"use client";

import { useState } from "react";
import { BOOKING_STATUS_ORDER, type BookingStatus } from "@/types/db";

const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  en_route: "En route",
  in_progress: "In progress",
  completed: "Completed",
  canceled: "Canceled",
};

const STATUS_DESCRIPTIONS: Record<BookingStatus, string> = {
  requested: "Waiting for the worker to accept.",
  accepted: "Worker accepted. They'll head over soon.",
  en_route: "Worker is on the way to the job location.",
  in_progress: "Worker is on site doing the job.",
  completed: "Job done. Don't forget to leave a review.",
  canceled: "Booking was canceled.",
};

type Role = "client" | "worker";

type Transition = {
  to: BookingStatus;
  label: string;
  /** Which role is allowed to make this transition. */
  by: Role;
};

const TRANSITIONS: Record<BookingStatus, Transition[]> = {
  requested: [
    { to: "accepted", label: "Accept booking", by: "worker" },
    { to: "canceled", label: "Cancel", by: "client" },
  ],
  accepted: [
    { to: "en_route", label: "I'm heading over", by: "worker" },
    { to: "canceled", label: "Cancel", by: "client" },
  ],
  en_route: [
    { to: "in_progress", label: "I've arrived — starting", by: "worker" },
  ],
  in_progress: [
    { to: "completed", label: "Mark complete", by: "worker" },
  ],
  completed: [],
  canceled: [],
};

export function BookingStatusTracker({
  role,
  initialStatus = "requested",
  onCompleted,
}: {
  role: Role;
  initialStatus?: BookingStatus;
  onCompleted?: () => void;
}) {
  const [status, setStatus] = useState<BookingStatus>(initialStatus);
  const [history, setHistory] = useState<{ to: BookingStatus; at: Date }[]>([
    { to: initialStatus, at: new Date() },
  ]);

  function advance(to: BookingStatus) {
    setStatus(to);
    setHistory((h) => [...h, { to, at: new Date() }]);
    if (to === "completed") onCompleted?.();
  }

  const stepIndex = BOOKING_STATUS_ORDER.indexOf(status);
  const isCanceled = status === "canceled";

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">Booking status</h2>
          <p className="mt-1 text-xs text-gray-600">{STATUS_DESCRIPTIONS[status]}</p>
        </div>
        <span
          className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
            isCanceled
              ? "bg-rose-100 text-rose-700"
              : status === "completed"
                ? "bg-brand-100 text-brand-700"
                : "bg-amber-100 text-amber-800"
          }`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      {!isCanceled && (
        <ol className="mt-4 space-y-2 text-sm">
          {BOOKING_STATUS_ORDER.map((s, i) => {
            const done = i < stepIndex || status === "completed";
            const current = i === stepIndex && status !== "completed";
            return (
              <li key={s} className="flex items-center gap-3">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-brand-600 text-white"
                      : current
                        ? "bg-amber-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={
                    current
                      ? "font-semibold text-gray-900"
                      : done
                        ? "text-gray-600 line-through decoration-gray-300"
                        : "text-gray-500"
                  }
                >
                  {STATUS_LABELS[s]}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {isCanceled && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
          This booking was canceled. Both parties have been notified.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {TRANSITIONS[status]
          .filter((t) => t.by === role)
          .map((t) => (
            <button
              key={t.to}
              onClick={() => advance(t.to)}
              className={
                t.to === "canceled"
                  ? "btn-ghost !text-rose-600 hover:!bg-rose-50"
                  : "btn-primary"
              }
            >
              {t.label}
            </button>
          ))}
        {TRANSITIONS[status].filter((t) => t.by === role).length === 0 && (
          <p className="text-xs text-gray-500">
            {status === "completed"
              ? "Nothing else to do here — the job is done."
              : role === "client"
                ? "Waiting for the worker to take the next step."
                : "Waiting for the client to take the next step."}
          </p>
        )}
      </div>

      {history.length > 1 && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer select-none hover:text-gray-700">
            Status history
          </summary>
          <ul className="mt-2 space-y-1">
            {history.slice().reverse().map((h, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{STATUS_LABELS[h.to]}</span>
                <span>{h.at.toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
