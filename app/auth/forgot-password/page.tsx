"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();

    // Supabase intentionally returns success even when the email isn't in the
    // system (prevents email enumeration). Show the same confirmation either way.
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setSubmitting(false);

    if (resetErr) {
      setError(resetErr.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:px-8">
        <div className="card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-3xl">
            📬
          </div>
          <h1 className="mt-4 text-center text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            If an account exists for <span className="font-semibold">{email}</span>, we&apos;ve sent it a
            password-reset link. It expires in 1 hour.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/auth/sign-in" className="btn-secondary w-full">
              Back to sign in
            </Link>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-center text-xs text-gray-500 hover:text-gray-700 hover:underline"
            >
              Wrong email? Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Password reset</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Forgot your password?</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the email you used to sign up. We&apos;ll send you a reset link.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
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

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </button>

        <p className="text-center text-xs text-gray-500">
          Remembered it?{" "}
          <Link href="/auth/sign-in" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
