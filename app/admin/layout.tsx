import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/is-admin";
import { Avatar } from "@/components/avatar";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/kyc", label: "KYC queue" },
  { href: "/admin/workers", label: "Workers" },
  { href: "/admin/bookings", label: "Bookings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const guard = await requireAdmin();
  if (!guard) redirect("/account");

  const { profile } = guard;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar url={profile.avatar_url} name={profile.full_name} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Admin console
            </p>
            <p className="truncate text-sm text-gray-700">
              {profile.full_name ?? profile.email}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {children}
    </div>
  );
}
