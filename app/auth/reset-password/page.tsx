"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Supabase drops a recovery session into the browser when the user clicks
  // the reset link. If there's no session by the time this page loads, the
  // link was probably expired or reused.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        setError(
          "This reset link is expired or has already been used. Request a new one.",
        );
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);

    const supabase = createClient();
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    setDone(true);
    // Send them to /account after a short beat so they see confirmation.
    setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 1500);
  }

  if (done) {
    return (
      <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:px-8">
        <div className="card text-center">
          <p className="text-3xl">✓</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Password updated</h1>
          <p className="mt-2 text-sm text-gray-600">Signing you in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Password reset</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Set a new password</h1>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <PasswordInput
          id="new-password"
          label="New password"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />

        <PasswordInput
          id="confirm-password"
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          required
          minLength={6}
          placeholder="Repeat the new password"
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
            {!ready && (
              <p className="mt-2">
                <Link
                  href="/auth/forgot-password"
                  className="font-semibold underline"
                >
                  Request a new reset link
                </Link>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={submitting || !ready}
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
