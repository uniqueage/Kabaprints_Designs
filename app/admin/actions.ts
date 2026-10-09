"use server";

import { redirect } from "next/navigation";
import { promoteCurrentUserToAdmin } from "@/lib/supabase/auth";
import { adminUpdateOrderStatus } from "@/app/lib/orders.server";

/**
 * POST server action: promote the currently signed-in user to admin.
 * Guarded: only works for a signed-in user. Use this once to bootstrap your
 * own admin account, or set the role from the Supabase Dashboard.
 */
export async function promoteToAdminAction() {
  const result = await promoteCurrentUserToAdmin();
  if (result.error) {
    return { error: result.error };
  }
  if (result.alreadyAdmin) {
    return { ok: "You already have the admin role." };
  }
  return { ok: "Your account now has the admin role. Refresh the page." };
}

/**
 * POST server action: update an order's status.
 * Uses the service role key server-side. Expects form fields: orderId, status.
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
