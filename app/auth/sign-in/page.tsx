"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-gray-500">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      setError(signInErr.message);
      setSubmitting(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Welcome back</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Sign in to Sure Hands</h1>
        <p className="mt-1 text-sm text-gray-600">
          New here?{" "}
          <Link
            href={`/auth/sign-up?next=${encodeURIComponent(next)}`}
            className="font-semibold text-brand-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
