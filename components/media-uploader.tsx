"use client";

import { useRef, useState } from "react";

export type PickedMedia = {
  file: File;
  previewUrl: string;
  kind: "image" | "video";
};

const MAX_FILES = 3;
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

export function MediaUploader({
  onChange,
}: {
  onChange: (media: PickedMedia[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<PickedMedia[]>([]);
  const [error, setError] = useState<string | null>(null);

  function pushFiles(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) return;

    const next: PickedMedia[] = [...items];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_FILES) {
        setError(`Max ${MAX_FILES} attachments.`);
        break;
      }
      if (f.size > MAX_BYTES) {
        setError(`"${f.name}" is over 15MB.`);
        continue;
      }
      const kind: PickedMedia["kind"] = f.type.startsWith("video/") ? "video" : "image";
      if (kind !== "video" && !f.type.startsWith("image/")) {
        setError(`"${f.name}" isn't an image or video.`);
        continue;
      }
      next.push({ file: f, previewUrl: URL.createObjectURL(f), kind });
    }
    setItems(next);
    onChange(next);
  }

  function remove(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {items.map((m, i) => (
          <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {m.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.previewUrl} alt={`Attachment ${i + 1}`} className="h-full w-full object-cover" />
            ) : (
              <video src={m.previewUrl} className="h-full w-full object-cover" muted />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-xs text-white transition hover:bg-black"
              aria-label={`Remove attachment ${i + 1}`}
            >
              ×
            </button>
            {m.kind === "video" && (
              <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] font-medium text-white">
                video
              </span>
            )}
          </div>
        ))}

        {items.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-gray-300 text-gray-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            <div className="text-center">
              <div className="text-2xl leading-none">+</div>
              <div className="mt-1 text-[10px] font-medium uppercase">Add</div>
            </div>
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Up to {MAX_FILES} photos or videos. Each &lt; 15 MB. Helps workers give an accurate quote.
      </p>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => pushFiles(e.target.files)}
      />
    </div>
  );
}
