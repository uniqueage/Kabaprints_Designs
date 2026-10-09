"use server";

import { redirect } from "next/navigation";
import { adminUpdateOrderStatus } from "@/app/lib/orders.server";

/**
 * Update an order's status.
 * Expects form fields: orderId, status.
 *
 * On success redirects back to /admin/orders with ?ok=.
 * On error redirects back with ?error=.
 */
export async function updateOrderStatusAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const next = String(formData.get("next") ?? "").trim() || "/admin/orders";

  if (!orderId) {
    redirect(`${next}?error=Missing+order+id.`);
  }
  if (!status) {
    redirect(`${next}?error=Missing+status.`);
  }

  try {
    await adminUpdateOrderStatus(orderId, status as Parameters<typeof adminUpdateOrderStatus>[1]);
    redirect(`${next}?ok=Status+updated.`);
  } catch (err) {
    redirect(`${next}?error=${encodeURIComponent(err instanceof Error ? err.message : String(err))}`);
  }
}
