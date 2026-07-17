"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PhotoUploader } from "@/components/photo-uploader";
import { PasswordInput } from "@/components/password-input";
import { CATEGORIES, ENUGU_NEIGHBOURHOODS } from "@/lib/fixtures";

type Role = "client" | "worker";
const MAX_OPERATING = 3;

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

  // Worker-only fields
  const [categoryName, setCategoryName] = useState<string>("");
  const [operating, setOperating] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleOperating(name: string) {
    setOperating((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= MAX_OPERATING) return prev; // cap silently
      return [...prev, name];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Client-side validation for worker requirements
    if (role === "worker") {
      if (!categoryName) {
        setError("Pick a category (what kind of work you do).");
        setSubmitting(false);
        return;
      }
      if (operating.length === 0) {
        setError("Choose at least one operating neighbourhood.");
        setSubmitting(false);
        return;
      }
    }

    const supabase = createClient();

    const categoryId = CATEGORIES.find((c) => c.name === categoryName)?.id;

    const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Read by the handle_new_user() trigger to populate profiles + workers
        data: {
          full_name: fullName,
          role,
          phone,
          ...(role === "worker" && {
            category_id: categoryId ?? null,
            category_name: categoryName,
            operating_neighbourhoods: operating,
          }),
        },
      },
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setSubmitting(false);
      return;
    }

    // Supabase security: for existing emails it returns a "user" object with an
    // empty identities array, and does NOT send an email. Detect and show a real
    // error instead of leaving the user staring at a check-email page forever.
    if (signUp.user && (signUp.user.identities ?? []).length === 0) {
      setError(
        "This email is already registered. Try signing in instead, or use the password-reset link if you've forgotten your password.",
      );
      setSubmitting(false);
      return;
    }

    if (!signUp.user) {
      setError("Could not create account. Try again.");
      setSubmitting(false);
      return;
    }

    const hasSession = !!signUp.session;

    // Session available (email confirmation disabled) — finish inline.
    if (hasSession) {
      if (photo) {
        const userId = signUp.user.id;
        const ext = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${userId}/avatar/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("media")
          .upload(path, photo, { contentType: photo.type, upsert: true });
        if (!uploadErr) {
          const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
          await supabase
            .from("profiles")
            .update({ avatar_url: pub.publicUrl })
            .eq("id", userId);
        }
      }
      router.push(next);
      router.refresh();
      return;
    }

    // Stash the photo for /account to pick up post-verification.
    if (photo) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            sessionStorage.setItem("sure-hands:pending-avatar", String(reader.result));
            sessionStorage.setItem("sure-hands:pending-avatar-name", photo.name);
          } catch {
            /* private mode */
          }
        };
        reader.readAsDataURL(photo);
      } catch {
        /* ignore */
      }
    }

    // Redirect to the OTP-code verification page (preferred over magic link).
    router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Welcome to Sure Hands</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Already have one?{" "}
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(next)}`}
            className="font-semibold text-brand-700 hover:underline"
          >
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

        {role === "worker" && (
          <>
            <div>
              <label className="label" htmlFor="category">
                What kind of work do you do?
              </label>
              <select
                id="category"
                required
                className="input"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              >
                <option value="">Choose a category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                Operating neighbourhoods (pick 1–{MAX_OPERATING})
              </label>
              <div className="flex flex-wrap gap-2">
                {ENUGU_NEIGHBOURHOODS.map((n) => {
                  const picked = operating.includes(n);
                  const atCap = !picked && operating.length >= MAX_OPERATING;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleOperating(n)}
                      disabled={atCap}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        picked
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : atCap
                            ? "border-gray-200 bg-gray-50 text-gray-400"
                            : "border-gray-300 bg-white text-gray-700 hover:border-brand-400"
                      }`}
                    >
                      {picked ? "✓ " : ""}
                      {n}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {operating.length === 0
                  ? "Pick where you're willing to travel to for jobs."
                  : `${operating.length} of ${MAX_OPERATING} selected.`}
              </p>
            </div>
          </>
        )}

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
