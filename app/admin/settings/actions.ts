"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { upsertSiteSettings } from "@/lib/supabase/admin";
import type { PhonesJson } from "@/supabase/lib/types";

/**
 * Save site settings.
 *
 * Accepts the scalar settings plus repeated `phone_display` / `phone_tel`
 * inputs (one row per phone number in the admin form) and rebuilds
 * `phones_json`. On success the public site is revalidated so the new details
 * appear immediately.
 */
export async function saveSiteSettingsAction(formData: FormData) {
  const next = String(formData.get("next") ?? "").trim() || "/admin/settings";

  const phones = collectPhones(formData);

  const input = {
    site_name: String(formData.get("site_name") ?? "").trim() || null,
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    vision: String(formData.get("vision") ?? "").trim() || null,
    hours: String(formData.get("hours") ?? "").trim() || null,
    hours_days: String(formData.get("hours_days") ?? "").trim() || null,
    whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    ...(phones.length > 0 ? { phones_json: phones } : {}),
  };

  try {
    await upsertSiteSettings(input as Parameters<typeof upsertSiteSettings>[0]);
  } catch (err) {
    redirect(`${next}?error=${encodeURIComponent(err instanceof Error ? err.message : String(err))}`);
  }

  revalidatePath("/", "layout");
  redirect(`${next}?ok=Site+settings+saved.+The+public+site+is+already+updated.`);
}

/** Build the phone list from the repeated form rows, dropping empty rows. */
function collectPhones(formData: FormData): PhonesJson[] {
  const displays = formData.getAll("phone_display").map((v) => String(v).trim());
  const tels = formData.getAll("phone_tel").map((v) => String(v).trim());
  const count = Math.max(displays.length, tels.length);

  const phones: PhonesJson[] = [];
  for (let i = 0; i < count; i += 1) {
    const display = displays[i] ?? "";
    const tel = tels[i] ?? "";
    if (!display && !tel) continue;
    phones.push({ display: display || tel, tel: tel || display });
  }
  return phones;
}
