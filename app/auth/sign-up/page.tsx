"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PhotoUploader } from "@/components/photo-uploader";
import { PasswordInput } from "@/components/password-input";

type Role = "client" | "worker";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-gray-500">Loading…</div>}>
      <SignUpInner />
    </Suspense>
  );
}

function SignUpInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";

  const [role, setRole] = useState<Role>("client");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();

    const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, phone },
      },
    });

    if (signUpErr || !signUp.user) {
      setError(signUpErr?.message ?? "Could not create account. Try again.");
      setSubmitting(false);
      return;
    }

    const userId = signUp.user.id;
    let avatarUrl: string | null = null;

    if (photo) {
      const ext = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/avatar/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("media")
        .upload(path, photo, { contentType: photo.type, upsert: true });

      if (uploadErr) {
        // Non-fatal — the account exists, the user can re-upload from /account.
        console.warn("Avatar upload failed:", uploadErr.message);
      } else {
        const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
        avatarUrl = publicUrl.publicUrl;
      }
    }

    const { error: profileErr } = await supabase.from("profiles").upsert({
      id: userId,
      role,
      full_name: fullName,
      email,
      phone: phone || null,
      avatar_url: avatarUrl,
    });

    if (profileErr) {
      // Likely a Supabase email-confirmation flow — the user_id exists in auth but profiles RLS may fail until confirmed.
      // We surface a friendly message either way.
      setError(
        profileErr.message.includes("row-level security")
          ? "Check your email to confirm your account, then sign in to finish your profile."
          : profileErr.message,
      );
      setSubmitting(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Welcome to Sure Hands</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Already have one?{" "}
          <Link href={`/auth/sign-in?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { v: "client", title: "Client", sub: "I need help" },
                { v: "worker", title: "Worker", sub: "I do the work" },
              ] as const
            ).map((r) => (
              <button
                key={r.v}
                type="button"
                onClick={() => setRole(r.v)}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  role === r.v
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <span className="block text-sm font-semibold">{r.title}</span>
                <span className="block text-xs opacity-80">{r.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Profile photo</label>
          <PhotoUploader initialName={fullName} onFileSelected={setPhoto} />
        </div>

        <div>
          <label className="label" htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            required
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Chibuzo Okafor"
          />
        </div>

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
          <label className="label" htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 803 ..."
            autoComplete="tel"
          />
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-xs text-gray-500">
          By creating an account, you agree that Sure Hands will store your details to match you with verified
          workers / clients in your area.
        </p>
      </form>
    </div>
  );
}
