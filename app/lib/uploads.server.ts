/**
 * Design upload server functions for Kabaprints.
 *
 * Customers upload print-ready artwork (PNG, JPG/JPEG, PDF, SVG) which is
 * stored in the private `design` storage bucket. Each file is owned by the
 * authenticated user (owner = auth.uid()), so RLS guarantees users can only
 * access their own uploads. A row is also inserted into `design_uploads`.
 *
 * Two endpoints / flows:
 *  1. Upload a file from a Server Action / Route Handler:
 *       uploadDesignFile({ userId, file: FormDataFile, orderId?, notes? })
 *     Returns the created DesignUpload row + the storage path.
 *  2. List / remove a user's uploads (RLS-gated via the anon client):
 *       listMyUploads(), removeMyUpload(fileId)
 *
 * Storage bucket rules (in migration 0002):
 *   - `design` is private; only the owner (auth.uid) can upload/view/delete.
 *   - File size limit 25 MB; allowed mime types: image/png, image/jpeg,
 *     application/pdf, image/svg+xml.
 *
 * IMPORTANT: this uses the Supabase JS client's storage upload API. In Vercel
 * Serverless/Edge runtime the upload goes through the Supabase API (not the
 * local filesystem), so the file is streamed to Supabase Storage. For very
 * large files you may want a presigned URL flow — out of scope for this release.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "@/lib/supabase/env";
import type { DesignUpload } from "@/supabase/lib/types";

const ALLOWED_MIME: string[] = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "image/svg+xml",
];

const ALLOWED_EXT: string[] = [".png", ".jpg", ".jpeg", ".pdf", ".svg"];

// Accept browser File, ArrayBuffer, or Node Buffer-like bodies.
// In a Server Action, the framework gives us a File; in a Route Handler you
// may pass an ArrayBuffer or a Buffer. We normalize to ArrayBuffer for the
// Supabase Storage upload API.
export type UploadDesignFileLike =
  | File
  | Blob
  | ArrayBuffer
  | { arrayBuffer(): Promise<ArrayBuffer>; name?: string; type?: string; size?: number }
  | { buffer?: ArrayBuffer; arrayBuffer?: () => ArrayBuffer; name?: string; type?: string; size?: number };

// Narrow accessors for file-like bodies without using 'any'.
// UploadDesignFileLike is intentionally a broad union; these helpers narrow
// via instanceof checks and a final 'unknown' branch cast to never so we
// satisfy the linter while still handling the runtime shape we accept.
function fileLikeName(file: UploadDesignFileLike): string | undefined {
  if (file instanceof File) return file.name;
  if (file instanceof Blob) return undefined;
  if (file instanceof ArrayBuffer) return undefined;
  // { name?: string } branch
  const obj = file as { name?: string };
  return obj.name;
}
function fileLikeMime(file: UploadDesignFileLike): string | undefined {
  if (file instanceof File) return file.type;
  if (file instanceof Blob) return file.type;
  const obj = file as { type?: string };
  return obj.type;
}
function fileLikeSize(file: UploadDesignFileLike): number {
  if (file instanceof File) return file.size;
  if (file instanceof Blob) return file.size;
  if (file instanceof ArrayBuffer) return file.byteLength;
  const obj = file as { size?: number };
  return obj.size ?? 0;
}

// ---------- helpers ----------
function extFromName(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

function extFromMime(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "application/pdf") return ".pdf";
  if (mime === "image/svg+xml") return ".svg";
  return "";
}

/**
 * Sanitise a filename: keep only the basename + extension, lowercase ext,
 * strip path separators, truncate to a safe length.
 */
function safeFilename(name: string, userId: string): string {
  const ext = extFromName(name);
  const base = name
    .replace(/^.*[/\\]/, "")            // strip any directory
    .replace(/[^a-zA-Z0-9._-]/g, "_")  // unsafe chars
    .slice(0, 120);
  // Ensure we keep a sensible extension even if the original had a weird case.
  const normExt = ext.toLowerCase();
  if (ALLOWED_EXT.includes(normExt)) {
    return `${base}${normExt}`;
  }
  // If there's no supported extension but the mime is allowed, append one.
  return base;
}

/**
 * Build the storage path: /design/{userId}/{safeFilename}
 */
function storagePath(userId: string, filename: string): string {
  return `/design/${userId}/${filename}`;
}

// ---------- upload ----------
export interface UploadDesignFileInput {
  userId: string;             // auth.uid() — must be a signed-in user
  file: UploadDesignFileLike; // browser File or ArrayBuffer/Buffer-like body
  orderId?: string | null;    // optional link to an order
  notes?: string | null;
}

export interface UploadDesignFileResult {
  upload: DesignUpload;
  storagePath: string;     // public construct: /design/{userId}/{filename}
  storageUrl: string;      // full URL to the object (for admin preview)
}

/**
 * Upload a single design file to the private `design` bucket and insert a row.
 *
 * On Vercel (Node/Edge runtime) the `file` should be a Buffer or a fetchable
 * body. For browser-originated uploads from a Server Action, the framework
 * gives us a File-like object; we convert it to an ArrayBuffer and pass it to
 * supabase.storage.from(bucket).upload(path, arrayBuffer, opts).
 */
export async function uploadDesignFile(input: UploadDesignFileInput): Promise<UploadDesignFileResult> {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables."
    );
  }

  const userId = input.userId;
  if (!userId) {
    throw new Error("userId is required");
  }

  // Validate file
  const name = fileLikeName(input.file) ?? `design-${Date.now()}`;
  const ext = extFromName(name);
  if (!ALLOWED_EXT.includes(ext)) {
    throw new Error(
      `Unsupported file type "${ext}". Allowed: PNG, JPG/JPEG, PDF, SVG.`
    );
  }
  const mime = fileLikeMime(input.file) ?? extFromMime(ext);
  if (!ALLOWED_MIME.includes(mime)) {
    throw new Error(`Unsupported MIME type "${mime}".`);
  }
  const size = fileLikeSize(input.file);
  if (size > 25 * 1024 * 1024) {
    throw new Error("File too large. Maximum size is 25 MB.");
  }

  // Prepare anon client for the design_uploads row (RLS: customer insert own)
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Storage upload: must be done with a client that has the right auth context.
  // The anon client's storage API will use the current session's token; the
  // upload policy requires owner = auth.uid(), so the session must belong to
  // `userId`. For a Server Action that runs as the signed-in user, this is
  // already the case (the action inherits the caller session). If you call this
  // from a server component without a session, you'd need the service role key
  // and explicitly set owner via the storage API — but the policy above requires
  // owner = auth.uid() for INSERT, so we upload as the user.
  const storage = anon.storage.from("design");

  const safeName = safeFilename(name, userId);
  const path = storagePath(userId, safeName);

  // Convert file to ArrayBuffer for the upload API.
  let buffer: ArrayBuffer;
  if (input.file instanceof ArrayBuffer) {
    buffer = input.file;
  } else if (input.file instanceof File) {
    buffer = await input.file.arrayBuffer();
  } else if (input.file instanceof Blob) {
    buffer = await input.file.arrayBuffer();
  } else {
    // Plain object branch (the { arrayBuffer?() } or { buffer? } shapes).
    const obj = input.file as { arrayBuffer?: () => ArrayBuffer; buffer?: ArrayBuffer };
    if (typeof obj.arrayBuffer === "function") {
      buffer = await obj.arrayBuffer();
    } else if (obj.buffer instanceof ArrayBuffer) {
      buffer = obj.buffer;
    } else {
      throw new Error("Unsupported file type for upload.");
    }
  }

  const { data: uploadData, error: uploadError } = await storage.upload(path, buffer, {
    cacheControl: "public, max-age=86400",
    contentType: mime,
    upsert: false,
  });

  if (uploadError || !uploadData) {
    throw new Error(`Storage upload failed: ${uploadError?.message ?? "unknown error"}`);
  }

  // Insert the metadata row (RLS: customer insert own — runs as the signed-in user)
  const { data: row, error: rowError } = await anon
    .from("design_uploads")
    .insert({
      customer_id: userId,
      file_path: path,
      file_name: safeName,
      file_mime: mime,
      file_size: size,
      status: "pending",
      notes: input.notes ?? null,
      order_id: input.orderId ?? null,
    })
    .select()
    .single();

  if (rowError || !row) {
    // Roll back the storage object if the DB row failed (best effort).
    try {
      await storage.remove([path]);
    } catch {
      // ignore rollback errors
    }
    throw new Error(`Failed to record upload: ${rowError?.message ?? "unknown error"}`);
  }

  // Full URL for admin/owner preview. The private bucket requires an authenticated
  // download, so this URL is not a public CDN link — it's the storage API object URL.
  const projectUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const host = new URL(projectUrl).hostname;
  const storageUrl = `https://${host}/storage/v1/object/design/${path}`;

  return {
    upload: row as unknown as DesignUpload,
    storagePath: path,
    storageUrl,
  };
}

// ---------- list my uploads ----------
export async function listMyUploads(userId: string): Promise<DesignUpload[]> {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables."
    );
  }

  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data, error } = await client
    .from("design_uploads")
    .select("*")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list uploads: ${error.message}`);
  }

  return (data ?? []) as unknown as DesignUpload[];
}

// ---------- remove my upload ----------
export async function removeMyUpload(userId: string, fileId: string): Promise<void> {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables."
    );
  }

  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Fetch the file path first so we can also remove the storage object.
  const { data: row, error: fetchError } = await client
    .from("design_uploads")
    .select("file_path")
    .eq("id", fileId)
    .eq("customer_id", userId)
    .maybeSingle();

  if (fetchError || !row) {
    throw new Error(`Upload not found or not owned by you: ${fileId}`);
  }

  // Delete the DB row (RLS: customer update own covers DELETE via the update policy,
  // but we use the delete policy explicitly — both are gated by customer_id = auth.uid()).
  const { error: delError } = await client.from("design_uploads").delete().eq("id", fileId);
  if (delError) {
    throw new Error(`Failed to remove upload record: ${delError.message}`);
  }

  // Remove the storage object (RLS: owners delete own)
  const storage = client.storage.from("design");
  const { error: storageError } = await storage.remove(row.file_path);
  if (storageError) {
    // Non-fatal: the record is gone even if the storage object lingers. Surface as warning.
    console.warn(`Storage object removal failed for ${row.file_path}: ${storageError.message}`);
  }
}

// ---------- admin: list all uploads (service role) ----------
export async function adminListUploads(limit = 200): Promise<DesignUpload[]> {
  const env = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!env || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables."
    );
  }

  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);
  const { data, error } = await admin
    .from("design_uploads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list uploads (admin): ${error.message}`);
  }

  return (data ?? []) as unknown as DesignUpload[];
}

// ---------- admin: update upload status ----------
export async function adminUpdateUploadStatus(
  fileId: string,
  status: DesignUpload["status"],
  notes?: string
): Promise<DesignUpload> {
  const env = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!env || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables."
    );
  }

  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);
  const { data, error } = await admin
    .from("design_uploads")
    .update({
      status,
      notes: notes ?? undefined,
    })
    .eq("id", fileId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update upload ${fileId}: ${error?.message ?? "not found"}`);
  }

  return data as unknown as DesignUpload;
}
