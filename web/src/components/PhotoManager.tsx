"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { FormMessage } from "@/components/FormField";
import { deletePhoto, recordPhoto } from "@/lib/spa-actions";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTOS = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type PhotoManagerProps = {
  spaId: string;
  photos: { id: string; url: string }[];
};

export function PhotoManager({ spaId, photos }: PhotoManagerProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError(undefined);

    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const badFile = files.find((file) => !EXTENSIONS[file.type] || file.size > MAX_FILE_SIZE);
    if (badFile) {
      setError(`${badFile.name} must be a JPG, PNG or WebP photo under 5 MB.`);
      return;
    }

    setBusy(true);
    const supabase = createClient();

    for (const file of files) {
      const path = `${spaId}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
      const { error: uploadError } = await supabase.storage
        .from("spa-photos")
        .upload(path, file);

      if (uploadError) {
        setError(`We could not upload ${file.name}. Please try again.`);
        break;
      }

      const result = await recordPhoto(spaId, path);
      if (result.error) {
        setError(result.error);
        break;
      }
    }

    setBusy(false);
    router.refresh();
  }

  async function remove(photoId: string) {
    setBusy(true);
    setError(undefined);
    const result = await deletePhoto(photoId);
    if (result.error) {
      setError(result.error);
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={photo.url}
                alt="Spa photo"
                fill
                sizes="(min-width: 640px) 200px, 45vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => remove(photo.id)}
                disabled={busy}
                className="absolute top-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <label className="cursor-pointer self-start rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium transition hover:border-brand">
        {busy ? "Working..." : "Add photos"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={upload}
          className="sr-only"
        />
      </label>
      <FormMessage error={error} />
    </div>
  );
}
