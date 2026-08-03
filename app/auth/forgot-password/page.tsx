"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();

    // Supabase intentionally returns success even when the email isn't in the
    // system (prevents email enumeration). We proceed to the verify-reset
    // page either way — a stranger typing another user's email won't be able
    // to enter the code they didn't receive.
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setSubmitting(false);

    if (resetErr) {
      setError(resetErr.message);
      return;
    }

    // Send the user to the 6-digit code screen. If the Supabase "Reset
    // Password" template still uses {{ .ConfirmationURL }} instead of
    // {{ .Token }}, the verify-reset page shows a fallback link to use the
    // magic link they received instead.
    router.push(`/auth/verify-reset?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Password reset</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Forgot your password?</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the email you used to sign up. We&apos;ll email you a 6-digit code.
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
          {submitting ? "Sending…" : "Send reset code"}
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
