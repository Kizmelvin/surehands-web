"use client";

import { useRef, useState } from "react";
import { Avatar } from "./avatar";

export function PhotoUploader({
  initialUrl,
  initialName,
  onFileSelected,
}: {
  initialUrl?: string | null;
  initialName?: string | null;
  onFileSelected: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | null) {
    setError(null);
    if (!file) {
      setPreview(initialUrl ?? null);
      setFileName(null);
      onFileSelected(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    onFileSelected(file);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar url={preview} name={initialName} size="lg" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-brand-600 text-white shadow-soft transition hover:bg-brand-700"
          aria-label="Upload photo"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1">
        <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary !py-2 !text-xs">
          {preview ? "Change photo" : "Upload photo"}
        </button>
        {preview && (
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="btn-ghost !ml-2 !py-2 !text-xs"
          >
            Remove
          </button>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {fileName ? `Selected: ${fileName}` : "JPG or PNG, up to 5MB. Used as your avatar."}
        </p>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
