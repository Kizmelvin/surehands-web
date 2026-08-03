"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function VerifyResetPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-gray-500">Loading…</div>}>
      <VerifyResetInner />
    </Suspense>
  );
}

function VerifyResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("We don't have an email to verify against. Start over.");
      return;
    }
    if (code.trim().length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setSubmitting(true);

    const supabase = createClient();
    // `type: 'recovery'` is the OTP type Supabase issues for
    // resetPasswordForEmail. On success we have a full session and can
    // send the user to /auth/reset-password to pick a new password.
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "recovery",
    });

    if (verifyErr) {
      setError(
        /invalid|expired|otp/i.test(verifyErr.message)
          ? "That code is invalid or expired. Try requesting a new one."
          : verifyErr.message,
      );
      setSubmitting(false);
      return;
    }

    router.push("/auth/reset-password");
    router.refresh();
  }

  async function resend() {
    if (!email) return;
    setResending(true);
    setResent(false);
    setError(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setResending(false);
    if (err) {
      setError(err.message);
      return;
    }
    setResent(true);
  }

  return (
    <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:px-8">
      <div className="card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-3xl">
          🔑
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold text-gray-900">
          Enter your reset code
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a 6-digit code to{" "}
          {email ? (
            <span className="font-semibold text-gray-900">{email}</span>
          ) : (
            "your inbox"
          )}
          . Enter it below to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="reset-code">
              Reset code
            </label>
            <input
              id="reset-code"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              required
              className="input text-center text-2xl font-bold tracking-[0.6em]"
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting || code.length < 6}
          >
            {submitting ? "Verifying…" : "Verify code"}
          </button>
        </form>

        <div className="mt-6 space-y-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={resend}
            disabled={resending || resent || !email}
            className="btn-secondary w-full disabled:opacity-60"
          >
            {resent ? "Code re-sent ✓" : resending ? "Sending…" : "Resend code"}
          </button>
          <p className="text-center text-xs text-gray-500">
            Got a magic link email instead?{" "}
            <Link
              href="/auth/reset-password"
              className="font-semibold text-brand-700 hover:underline"
            >
              Use it here
            </Link>
          </p>
          <p className="text-center text-xs text-gray-500">
            Wrong email?{" "}
            <Link href="/auth/forgot-password" className="underline-offset-2 hover:underline">
              Start over
            </Link>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        <p className="font-semibold">Admin note</p>
        <p className="mt-1">
          For the reset code to arrive as digits (not a link), the Supabase
          project&apos;s <strong>Reset Password</strong> email template must
          include the <code>&#123;&#123; .Token &#125;&#125;</code> variable.
          Edit it in Supabase Dashboard → Authentication → Email Templates →
          Reset Password.
        </p>
      </div>
    </div>
  );
}
