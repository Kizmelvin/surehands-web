import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/fixtures";

export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  status: string;
  agreed_price: number;
  created_at: string;
  client: string | null;
  worker: string | null;
};

async function loadBookings(): Promise<BookingRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      agreed_price,
      created_at,
      client:profiles!bookings_client_user_id_fkey (full_name, email),
      worker:profiles!bookings_worker_user_id_fkey (full_name, email)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (!data) return [];

  return data.map((b) => {
    const c = Array.isArray(b.client) ? b.client[0] : b.client;
    const w = Array.isArray(b.worker) ? b.worker[0] : b.worker;
    return {
      id: b.id,
      status: b.status,
      agreed_price: b.agreed_price,
      created_at: b.created_at,
      client: c?.full_name ?? c?.email ?? null,
      worker: w?.full_name ?? w?.email ?? null,
    };
  });
}

const STATUS_TONE: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  en_route: "bg-purple-100 text-purple-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-brand-100 text-brand-800",
  canceled: "bg-rose-100 text-rose-800",
};

export default async function AdminBookingsPage() {
  const bookings = await loadBookings();

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-600">
            {bookings.length} most-recent bookings across the platform.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-brand-700 hover:underline">
          ← Overview
        </Link>
      </header>

      {bookings.length === 0 ? (
        <div className="card text-center text-gray-600">
          <p className="text-3xl">📋</p>
          <p className="mt-2 text-base font-semibold text-gray-900">No bookings yet.</p>
          <p className="mt-1 text-sm">
            When a client accepts a proposal, it becomes a booking and shows here.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            If you expect entries here and see none, run{" "}
            <code>migrations/001_bookings_and_reviews.sql</code> first.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
                        STATUS_TONE[b.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{b.client ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-900">{b.worker ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-900">{formatNaira(b.agreed_price)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(b.created_at).toLocaleString("en-NG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
