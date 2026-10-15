"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteProduct, listServices, listProductsForService, upsertProduct } from "@/lib/supabase/admin";
import { deleteUploadedImage, resolveSubmittedImage } from "@/lib/supabase/storage";
import { adminUpdateUploadStatus } from "@/app/lib/uploads.server";
import type { Product, UploadStatus } from "@/supabase/lib/types";

/**
 * Create or update a product from the admin create/edit form.
 *
 * An uploaded file (field `image_file`) wins over the typed `image` value, so
 * the owner can either point at a bundled asset or upload their own picture.
 * On success the public site is revalidated and the admin is redirected back
 * to the product list with a confirmation message.
 */
export async function saveProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const serviceId = String(formData.get("service_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const blurb = String(formData.get("blurb") ?? "").trim();
  const ordinalRaw = Number(formData.get("ordinal") ?? "0");
  const backTo = id ? `/admin/products/${id}/edit` : "/admin/products/new";

  const fail = (message: string): never => redirect(`${backTo}?error=${encodeURIComponent(message)}`);

  if (!serviceId) fail("Choose the service this product belongs to.");
  if (!title) fail("Give the product a title.");
  if (!blurb) fail("Add a short description for the product.");

  let image = "";
  try {
    image = await resolveSubmittedImage(formData);
  } catch (err) {
    fail(err instanceof Error ? err.message : "The image could not be processed.");
  }

  if (!image) fail("Add an image path or upload an image file.");

  try {
    await upsertProduct({
      id: id || undefined,
      service_id: serviceId,
      title,
      blurb,
      image,
      ordinal: Number.isNaN(ordinalRaw) ? 0 : ordinalRaw,
    });
  } catch (err) {
    fail(err instanceof Error ? err.message : "The product could not be saved.");
  }

  revalidatePath("/", "layout");
  redirect(`/admin/products?ok=${encodeURIComponent(id ? "Product updated." : "Product created.")}`);
}

/**
 * Delete a product. Also removes the associated image from the
 * products-images storage bucket (best-effort).
 *
 * On success redirects back to the products listing with an ?ok= message.
 * On error redirects back with a ?error= message.
 */
/**
 * Delete a product submitted from a form (hidden `id` field).
 */
export async function deleteProductFormAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/admin/products?error=Missing+product+id.");
  }
  await deleteProductAction(id);
}

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

  // Best-effort image removal. Bundled asset paths are left alone; only images
  // uploaded through the admin panel live in the storage bucket.
  try {
    await deleteUploadedImage(product.image);
  } catch {
    // image removal is best-effort; don't fail the delete.
  }

  await deleteProduct(productId);
  revalidatePath("/", "layout");
  redirect(`/admin/products?ok=Deleted+“${encodeURIComponent(product.title)}”.`);
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
