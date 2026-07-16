"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PhotoUploader } from "@/components/photo-uploader";
import { ENUGU_NEIGHBOURHOODS } from "@/lib/fixtures";

type Role = "client" | "worker";

type Initial = {
  full_name: string;
  phone: string;
  avatar_url: string | null;
  role: Role;
  operating_city: string;
  resident_city: string;
};

type Props = {
  userId: string;
  email: string;
  initial: Initial;
  /** False when /account loaded but no row existed in profiles (trigger never ran). */
  profileExists: boolean;
  /** True when the profile already has a full_name — locks the field. */
  lockFullName: boolean;
};

const PENDING_AVATAR_KEY = "sure-hands:pending-avatar";
const PENDING_AVATAR_NAME_KEY = "sure-hands:pending-avatar-name";

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

export function AccountEditor({
  userId,
  email,
  initial,
  profileExists,
  lockFullName,
}: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.full_name);
  const [phone, setPhone] = useState(initial.phone);
  const [residentCity, setResidentCity] = useState(initial.resident_city);
  const [operatingCity, setOperatingCity] = useState(initial.operating_city);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoFromStash, setPhotoFromStash] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Rehydrate a photo that was stashed during sign-up (when there was no session
  // yet, so we couldn't upload to storage). We auto-upload it on first save.
  useEffect(() => {
    if (typeof window === "undefined" || initial.avatar_url) return;
    const dataUrl = sessionStorage.getItem(PENDING_AVATAR_KEY);
    const name = sessionStorage.getItem(PENDING_AVATAR_NAME_KEY) ?? "avatar.jpg";
    if (!dataUrl) return;
    dataUrlToFile(dataUrl, name).then((file) => {
      setPhoto(file);
      setPhotoFromStash(file);
    });
  }, [initial.avatar_url]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();

    // Guard: must have a session to upload to a per-uid storage folder
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError("Your session expired. Sign in again, then save.");
      setSubmitting(false);
      return;
    }

    let nextAvatarUrl = initial.avatar_url;
    if (photo) {
      const ext = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/avatar/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("media")
        .upload(path, photo, { contentType: photo.type, upsert: true });
      if (uploadErr) {
        const friendly = /row-level security|policy/i.test(uploadErr.message)
          ? "Couldn't upload photo — your sign-in might be stale. Try signing out and back in."
          : `Photo upload failed: ${uploadErr.message}`;
        setError(friendly);
        setSubmitting(false);
        return;
      }
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      nextAvatarUrl = pub.publicUrl;
    }

    // UPSERT so we recover gracefully when the trigger didn't run (legacy accounts)
    const upsertBody: Record<string, unknown> = {
      id: userId,
      role: initial.role,
      email,
      phone: phone || null,
      avatar_url: nextAvatarUrl,
      resident_city: residentCity || null,
      operating_city: operatingCity || null,
    };

    // Only write full_name if it isn't already locked (i.e. wasn't set yet)
    if (!lockFullName && fullName.trim()) {
      upsertBody.full_name = fullName.trim();
    }

    const { error: writeErr } = profileExists
      ? await supabase
          .from("profiles")
          .update({
            ...(lockFullName ? {} : { full_name: fullName.trim() || null }),
            phone: phone || null,
            avatar_url: nextAvatarUrl,
            resident_city: residentCity || null,
            operating_city: operatingCity || null,
          })
          .eq("id", userId)
      : await supabase.from("profiles").upsert(upsertBody);

    if (writeErr) {
      setError(writeErr.message);
      setSubmitting(false);
      return;
    }

    // Clear the pending photo stash once it's been persisted
    if (photoFromStash) {
      sessionStorage.removeItem(PENDING_AVATAR_KEY);
      sessionStorage.removeItem(PENDING_AVATAR_NAME_KEY);
      setPhotoFromStash(null);
    }

    setSaved(true);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <h2 className="text-base font-semibold text-gray-900">Edit profile</h2>

      <div>
        <label className="label">Profile photo</label>
        <PhotoUploader
          initialUrl={initial.avatar_url}
          initialName={fullName}
          onFileSelected={setPhoto}
        />
        {photoFromStash && (
          <p className="mt-2 text-xs text-brand-700">
            Found the photo you picked at sign-up — it&apos;ll be saved when you hit &ldquo;Save changes&rdquo;.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={lockFullName}
            title={lockFullName ? "Contact support to change your name" : undefined}
          />
          {lockFullName && (
            <p className="mt-1 text-[11px] text-gray-500">Locked. Contact support to change.</p>
          )}
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} disabled />
          <p className="mt-1 text-[11px] text-gray-500">Locked.</p>
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 803 ..."
          />
        </div>
        <div>
          <label className="label">Role</label>
          <input className="input capitalize" value={initial.role} disabled />
          <p className="mt-1 text-[11px] text-gray-500">Locked.</p>
        </div>
        <div>
          <label className="label">Resident neighbourhood</label>
          <select className="input" value={residentCity} onChange={(e) => setResidentCity(e.target.value)}>
            <option value="">Choose…</option>
            {ENUGU_NEIGHBOURHOODS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
        {initial.role === "worker" && (
          <div>
            <label className="label">Operating neighbourhood</label>
            <select className="input" value={operatingCity} onChange={(e) => setOperatingCity(e.target.value)}>
              <option value="">Choose…</option>
              {ENUGU_NEIGHBOURHOODS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          Profile saved ✓
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
