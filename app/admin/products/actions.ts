"use server";

import { redirect } from "next/navigation";
import { deleteProduct, listServices, listProductsForService } from "@/lib/supabase/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/client";
import { adminUpdateUploadStatus } from "@/app/lib/uploads.server";
import type { Product, UploadStatus } from "@/supabase/lib/types";

/**
 * Delete a product. Also removes the associated image from the
 * products-images storage bucket (best-effort).
 *
 * On success redirects back to the products listing with an ?ok= message.
 * On error redirects back with a ?error= message.
 */
export async function deleteProductAction(productId: string) {
  if (!productId) {
    redirect("/admin/products?error=Missing+product+id.");
  }

  // Find the product (and its image) across all services.
  const services = await listServices();
  let product: Product | null = null;

  for (const svc of services) {
    const prods = await listProductsForService(svc.id);
    const found = prods.find((p) => p.id === productId);
    if (found) {
      product = found;
      break;
    }
  }

  if (!product) {
    redirect("/admin/products?error=Product+not+found.");
  }

  // Best-effort image removal from the public bucket.
  try {
    const admin = createSupabaseAdminClient();
    if (product.image.startsWith("/")) {
      await admin.storage.from("products-images").remove([product.image]);
    }
  } catch {
    // image removal is best-effort; don't fail the delete.
  }

  await deleteProduct(productId);
  redirect(`/admin/products?ok=Deleted+“${encodeURIComponent(product.title)}”.`);
}

/**
 * Update a product's core fields.
 */
export async function updateProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const blurb = String(formData.get("blurb") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const ordinal = Number(formData.get("ordinal") ?? "0");

  if (!id) return { error: "Missing product id." };
  if (!title) return { error: "Title is required." };
  if (!blurb) return { error: "Description is required." };
  if (!image) return { error: "Image path is required." };

  const { upsertProduct } = await import("@/lib/supabase/admin");
  try {
    await upsertProduct({
      id,
      service_id: String(formData.get("service_id") ?? ""),
      title,
      blurb,
      image,
      ordinal: Number.isNaN(ordinal) ? 0 : ordinal,
    });
    return { ok: "Product saved." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Update a design upload's status.
 */
export async function updateUploadStatusAction(formData: FormData) {
  const fileId = String(formData.get("fileId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as UploadStatus;

  if (!fileId) return { error: "Missing file id." };
  if (!["pending", "received", "proofing", "approved", "rejected"].includes(status)) {
    return { error: "Invalid status." };
  }

  try {
    await adminUpdateUploadStatus(fileId, status);
    return { ok: "Status updated." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
