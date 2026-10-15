/**
 * Server-only helpers for the public `products-images` Supabase Storage bucket.
 *
 * The admin dashboard uploads images here (products, portfolio, before/after,
 * hero slides). Files are stored under `uploads/<date>/<uuid>.<ext>` and the
 * absolute public URL is saved into the content tables, so the public site can
 * render them without any extra lookup.
 *
 * Uses the service-role client — never import this from a client component.
 */

import { createSupabaseAdminClient } from "./client";
import { getSupabaseEnv } from "./env";

export const CONTENT_IMAGE_BUCKET = "products-images";

const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg", "avif"]);

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext) ? ext : "png";
}

/**
 * Upload an image to the public bucket and return its absolute public URL.
 * Throws with a readable message when storage is not configured or the upload
 * fails, so the admin form can show the reason.
 */
export async function uploadPublicImage(file: File): Promise<string> {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured, so images cannot be uploaded. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
    );
  }

  const admin = createSupabaseAdminClient();
  const date = new Date().toISOString().slice(0, 10);
  const path = `uploads/${date}/${crypto.randomUUID()}.${extensionOf(file.name)}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(CONTENT_IMAGE_BUCKET)
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
      cacheControl: "31536000",
    });

  if (error) {
    throw new Error(
      `Image upload failed: ${error.message}. Check that the "${CONTENT_IMAGE_BUCKET}" storage bucket exists (run the schema push).`,
    );
  }

  const { data } = admin.storage.from(CONTENT_IMAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("The image uploaded but Supabase did not return a public URL.");
  }
  return data.publicUrl;
}

/** True when the stored value points at an object in our public bucket. */
export function isUploadedImage(value: string | null | undefined): boolean {
  if (!value) return false;
  return String(value).includes(`/storage/v1/object/public/${CONTENT_IMAGE_BUCKET}/`);
}

/**
 * Best-effort removal of an image that was uploaded through the admin panel.
 * Bundled asset paths (e.g. `/images/tshirt.svg`) are ignored.
 */
export async function deleteUploadedImage(value: string | null | undefined): Promise<void> {
  if (!isUploadedImage(value)) return;
  const marker = `/storage/v1/object/public/${CONTENT_IMAGE_BUCKET}/`;
  const raw = String(value);
  const path = raw.slice(raw.indexOf(marker) + marker.length).split("?")[0];
  if (!path) return;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from(CONTENT_IMAGE_BUCKET).remove([decodeURIComponent(path)]);
  if (error) throw new Error(error.message);
}

/**
 * Resolve the submitted image value: an uploaded file wins over the text field.
 * Returns the stored value (path or absolute URL) for the given form field.
 */
export async function resolveSubmittedImage(
  formData: FormData,
  fieldName = "image",
  fileFieldName = `${fieldName}_file`,
): Promise<string> {
  const file = formData.get(fileFieldName);
  if (file instanceof File && file.size > 0) {
    return uploadPublicImage(file);
  }
  return String(formData.get(fieldName) ?? "").trim();
}
