import type { Metadata } from "next";
import Image from "next/image";
import { FileText, Eye } from "@/lib/icons";
import { adminListUploads } from "@/app/lib/uploads.server";
import { updateUploadStatusAction } from "./actions";
import { createSupabaseAdminClient } from "@/lib/supabase/client";
import type { DesignUpload, UploadStatus } from "@/supabase/lib/types";

export const metadata: Metadata = { title: "Design uploads · Admin" };

const STATUS_LABEL: Record<UploadStatus, string> = {
  pending: "Pending",
  received: "Received",
  proofing: "Proofing",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_OPTIONS: UploadStatus[] = ["pending", "received", "proofing", "approved", "rejected"];

export default async function AdminDesignsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const ok = params["ok"];
  const error = params["error"];
  const uploads = await adminListUploads(200);

  return (
    <div>
      {ok && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-semibold text-green-800">
          {ok}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-coral-light border border-coral/30 p-4 text-sm font-semibold text-coral-dark">
          {error}
        </div>
      )}

      <div className="mb-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Design uploads</h1>
        <p className="mt-1 text-ink-soft">
          All customer artwork uploaded to the private{" "}
          <span className="font-semibold">design</span> bucket, newest first.
          Update the status as you review each file.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm">
        <div className="border-b border-silver-light/60 px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">
              {uploads.length} upload{uploads.length === 1 ? "" : "s"}
            </span>
            <span className="text-xs text-muted">Private bucket — only admins can list these.</span>
          </div>
        </div>

        {uploads.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">
            <FileText className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 font-semibold text-ink">No design uploads yet</p>
            <p className="mt-1">Customer artwork will appear here once uploaded via the site.</p>
          </div>
        ) : (
          <div className="divide-y divide-silver-light/40">
            {uploads.map((upload) => (
              <DesignRow key={upload.id} upload={upload} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function DesignRow({ upload }: { upload: DesignUpload }) {
  const downloadUrl = upload.file_path.startsWith("/")
    ? await downloadUrlFor(upload.file_path)
    : upload.file_path;

  return (
    <div className="group flex items-start gap-4 px-5 py-4 transition hover:bg-cream/50">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-silver-light/60">
        {isImage(upload.file_mime) && downloadUrl && (
          <Image src={downloadUrl} alt={upload.file_name} fill className="object-cover" sizes="56px" />
        )}
        {!isImage(upload.file_mime) && (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            <FileText className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{upload.file_name}</p>
        <p className="mt-0.5 text-xs text-muted font-mono">{upload.file_path}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatBytes(upload.file_size)}
          </span>
          <span>{upload.file_mime}</span>
          {upload.notes && <span>Notes: {upload.notes}</span>}
        </div>
        <p className="mt-1 text-xs text-muted">
          {new Date(upload.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="ml-auto shrink-0">
        <StatusSelect fileId={upload.id} currentStatus={upload.status} />
      </div>
    </div>
  );
}

function isImage(mime: string): boolean {
  return mime.startsWith("image/");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function downloadUrlFor(path: string): Promise<string | null> {
  try {
    const admin = createSupabaseAdminClient();
    const { data } = admin.storage.from("design").getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch {
    return null;
  }
}

function StatusSelect({ fileId, currentStatus }: { fileId: string; currentStatus: UploadStatus }) {
  return (
    <form action={updateUploadStatusAction} className="inline">
      <input type="hidden" name="fileId" value={fileId} />
      <input type="hidden" name="next" value="/admin/designs" />
      <div className="flex items-center gap-1">
        <select
          name="status"
          defaultValue={currentStatus}
          className="rounded-lg border border-silver-light bg-white px-2 py-1.5 text-xs font-semibold text-ink focus:border-brand focus:outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-brand-dark"
        >
          Update
        </button>
      </div>
    </form>
  );
}
