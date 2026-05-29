import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { AccountEditor } from "./account-editor";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, phone, avatar_url, nin_verified, operating_city, resident_city")
    .eq("id", user.id)
    .single();

  const dashboardHref = profile?.role === "worker" ? "/worker" : "/client";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">Your account</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {profile?.full_name ?? "Welcome"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Signed in as <span className="font-medium">{user.email}</span> · role:{" "}
            <span className="font-medium capitalize">{profile?.role ?? "—"}</span>
          </p>
        </div>
        <Link href={dashboardHref} className="btn-secondary">Go to dashboard →</Link>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <AccountEditor
          userId={user.id}
          email={user.email ?? ""}
          initial={{
            full_name: profile?.full_name ?? "",
            phone: profile?.phone ?? "",
            avatar_url: profile?.avatar_url ?? null,
            role: (profile?.role as "client" | "worker") ?? "client",
            operating_city: profile?.operating_city ?? "",
            resident_city: profile?.resident_city ?? "",
          }}
        />

        <aside className="space-y-4">
          <div className="card text-center">
            <Avatar url={profile?.avatar_url} name={profile?.full_name} size="lg" className="mx-auto" />
            <p className="mt-3 text-sm font-semibold text-gray-900">{profile?.full_name ?? "—"}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {profile?.nin_verified ? (
                <span className="chip-brand">✓ NIN verified</span>
              ) : (
                <span className="chip">NIN pending</span>
              )}
              <span className="chip capitalize">{profile?.role ?? "—"}</span>
            </div>
          </div>

          <form action="/auth/sign-out" method="POST">
            <button type="submit" className="btn-ghost w-full text-rose-600 hover:bg-rose-50">
              Sign out
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
