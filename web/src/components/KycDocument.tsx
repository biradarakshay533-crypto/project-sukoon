"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { FormMessage } from "@/components/FormField";
import { deleteKycDocument, recordKycDocument } from "@/lib/kyc-actions";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type KycFile = { id: string; fileName: string; url: string | null };

type KycDocumentProps = {
  spaId: string;
  kind: string;
  label: string;
  hint?: string;
  required?: boolean;
  files: KycFile[];
  editable: boolean;
  multiple?: boolean;
};

// Uploads one document straight to private storage, then records it.
export function KycDocument({ spaId, kind, label, hint, required, files, editable, multiple }: KycDocumentProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError(undefined);

    const badFile = chosen.find((file) => !EXTENSIONS[file.type] || file.size > MAX_FILE_SIZE);
    if (badFile) {
      setError(`${badFile.name} must be a PDF, JPG, PNG or WebP file under 5 MB.`);
      return;
    }

    setBusy(true);
    const supabase = createClient();

    for (const file of chosen) {
      const path = `${spaId}/${kind}-${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
      const { error: uploadError } = await supabase.storage.from("spa-kyc").upload(path, file);
      if (uploadError) {
        setError(`We could not upload ${file.name}. Please try again.`);
        break;
      }
      const result = await recordKycDocument(kind, path, file.name);
      if (result.error) {
        setError(result.error);
        break;
      }
    }

    setBusy(false);
    router.refresh();
  }

  async function remove(documentId: string) {
    setBusy(true);
    setError(undefined);
    const result = await deleteKycDocument(documentId);
    if (result.error) {
      setError(result.error);
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {label}
          {required && <span className="text-brand"> *</span>}
        </p>
        {editable && (
          <label className="cursor-pointer rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium transition hover:border-brand hover:text-brand">
            {busy ? "Uploading..." : files.length && !multiple ? "Replace file" : "Upload file"}
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              multiple={multiple}
              disabled={busy}
              onChange={upload}
              className="sr-only"
            />
          </label>
        )}
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {files.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-3 rounded-lg bg-accent-soft px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-green-700" aria-hidden="true">
                  ✓
                </span>
                <span className="truncate">{file.fileName}</span>
              </span>
              <span className="flex shrink-0 gap-3">
                {file.url && (
                  <a href={file.url} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">
                    View
                  </a>
                )}
                {editable && (
                  <button type="button" onClick={() => remove(file.id)} disabled={busy} className="text-muted hover:text-brand">
                    Remove
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted">No file yet. PDF or photo, up to 5 MB.</p>
      )}
      <FormMessage error={error} />
    </div>
  );
}
