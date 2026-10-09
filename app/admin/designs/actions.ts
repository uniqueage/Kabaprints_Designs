"use server";

import { redirect } from "next/navigation";
import { adminUpdateUploadStatus } from "@/app/lib/uploads.server";

/**
 * Update a design upload's status.
 * Expects form fields: fileId, status, next (optional).
 *
 * On success redirects back with ?ok=.
 * On error redirects back with ?error=.
 */
export async function updateUploadStatusAction(formData: FormData) {
  const fileId = String(formData.get("fileId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const next = String(formData.get("next") ?? "").trim() || "/admin/designs";

  if (!fileId) {
    redirect(`${next}?error=Missing+file+id.`);
  }
  if (!["pending", "received", "proofing", "approved", "rejected"].includes(status)) {
    redirect(`${next}?error=Invalid+status.`);
  }

  try {
    await adminUpdateUploadStatus(fileId, status as Parameters<typeof adminUpdateUploadStatus>[1]);
    redirect(`${next}?ok=Status+updated.`);
  } catch (err) {
    redirect(`${next}?error=${encodeURIComponent(err instanceof Error ? err.message : String(err))}`);
  }
}
