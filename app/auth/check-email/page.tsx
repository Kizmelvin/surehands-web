"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-gray-500">Loading…</div>}>
      <CheckEmailInner />
    </Suspense>
  );
}

function CheckEmailInner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    if (!email) {
      setError("We don't have an email to resend to. Try signing up again.");
      return;
    }
    setSending(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resend({ type: "signup", email });
    setSending(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto grid max-w-lg gap-6 px-4 py-12 md:px-8">
      <div className="card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-3xl">
          📬
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold text-gray-900">
          Check your email
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a confirmation link to{" "}
          {email ? (
            <span className="font-semibold text-gray-900">{email}</span>
          ) : (
            <span className="font-semibold text-gray-900">your inbox</span>
          )}
          . Click it to activate your account, then come back here to sign in.
        </p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Didn&apos;t get it?</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-amber-700">
            <li>Check your spam / promotions folder.</li>
            <li>Make sure the email above is right.</li>
            <li>Links expire after 1 hour — request a new one below.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/auth/sign-in" className="btn-primary w-full">
            I&apos;ve confirmed — sign me in
          </Link>
          <button
            type="button"
            onClick={resend}
            disabled={sending || sent || !email}
            className="btn-secondary w-full disabled:opacity-60"
          >
            {sent ? "Email re-sent ✓" : sending ? "Sending…" : "Resend confirmation email"}
          </button>
          {error && (
            <p className="text-center text-xs text-rose-600">{error}</p>
          )}
          <Link
            href="/auth/sign-up"
            className="text-center text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
          >
            Wrong email? Start over
          </Link>
        </div>
      </div>
    </div>
  );
}
