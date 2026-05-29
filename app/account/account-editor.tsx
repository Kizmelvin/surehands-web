"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

export function AccountEditor({
  userId,
  email,
  initial,
}: {
  userId: string;
  email: string;
  initial: Initial;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.full_name);
  const [phone, setPhone] = useState(initial.phone);
  const [residentCity, setResidentCity] = useState(initial.resident_city);
  const [operatingCity, setOperatingCity] = useState(initial.operating_city);
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();

    let nextAvatarUrl = initial.avatar_url;
    if (photo) {
      const ext = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/avatar/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("media")
        .upload(path, photo, { contentType: photo.type, upsert: true });
      if (uploadErr) {
        setError(`Photo upload failed: ${uploadErr.message}`);
        setSubmitting(false);
        return;
      }
      const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
      nextAvatarUrl = publicUrl.publicUrl;
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        avatar_url: nextAvatarUrl,
        resident_city: residentCity || null,
        operating_city: operatingCity || null,
      })
      .eq("id", userId);

    if (updateErr) {
      setError(updateErr.message);
      setSubmitting(false);
      return;
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} disabled />
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Role</label>
          <input className="input capitalize" value={initial.role} disabled />
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
