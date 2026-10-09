"use server";

import { redirect } from "next/navigation";
import { getSiteSettings, upsertSiteSettings } from "@/lib/supabase/admin";

/**
 * Save site settings.
 * Expects form fields matching SiteSettings keys.
 *
 * On success redirects back with ?ok=.
 * On error redirects back with ?error=.
 */
export async function saveSiteSettingsAction(formData: FormData) {
  const next = String(formData.get("next") ?? "").trim() || "/admin/settings";

  const input: Record<string, string | null> = {
    site_name: String(formData.get("site_name") ?? "").trim() || null,
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    vision: String(formData.get("vision") ?? "").trim() || null,
    hours: String(formData.get("hours") ?? "").trim() || null,
    hours_days: String(formData.get("hours_days") ?? "").trim() || null,
    whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
  };

  try {
    const settings = await upsertSiteSettings(input as Parameters<typeof upsertSiteSettings>[0]);
    redirect(`${next}?ok=Site+settings+saved.`);
  } catch (err) {
    redirect(`${next}?error=${encodeURIComponent(err instanceof Error ? err.message : String(err))}`);
  }
}
