"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/client";
import { deleteUploadedImage, resolveSubmittedImage } from "@/lib/supabase/storage";
import { getCollection, type CollectionDef } from "./collections";

/**
 * Generic create/update action for every content collection.
 *
 * The submitted `__collection` value is resolved against the registry, so only
 * known tables and known columns can ever be written — the browser cannot name
 * a table or a column of its own.
 */
export async function saveCollectionItemAction(formData: FormData) {
  const def = resolveCollection(formData);
  await saveItem(def, formData);
}

/** Generic delete action for every content collection. */
export async function deleteCollectionItemAction(formData: FormData) {
  const def = resolveCollection(formData);
  const backTo = `/admin/content/${def.slug}`;
  const id = String(formData.get("__id") ?? "").trim();
  if (!id) redirect(`${backTo}?error=Missing+item+id.`);

  const client = adminClientOrThrow();

  // Best-effort cleanup of images uploaded through the admin panel.
  const imageFields = def.imageFields ?? [];
  if (imageFields.length > 0) {
    try {
      const { data } = await client
        .from(def.table)
        .select(imageFields.join(","))
        .eq("id", id)
        .maybeSingle();
      const row = (data ?? null) as Record<string, unknown> | null;
      if (row) {
        for (const field of imageFields) {
          const value = row[field];
          if (typeof value === "string") await deleteUploadedImage(value).catch(() => undefined);
        }
      }
    } catch {
      // Cleanup is best-effort — never block the delete.
    }
  }

  try {
    const { error } = await client.from(def.table).delete().eq("id", id);
    if (error) redirect(`${backTo}?error=${encodeURIComponent(`Could not delete: ${error.message}`)}`);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    redirect(`${backTo}?error=${encodeURIComponent(err instanceof Error ? err.message : "Could not delete the item.")}`);
  }

  revalidatePath("/", "layout");
  redirect(`${backTo}?ok=${encodeURIComponent(`${capitalise(def.singular)} deleted.`)}`);
}

// ---------------------------------------------------------------------------

/** Look up the collection named by the submitted form, or bounce to the index. */
function resolveCollection(formData: FormData): CollectionDef {
  const slug = String(formData.get("__collection") ?? "").trim();
  const def = getCollection(slug);
  if (!def) redirect("/admin/content?error=Unknown+section.");
  return def;
}

function adminClientOrThrow(): SupabaseClient {
  try {
    return createSupabaseAdminClient();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Supabase is not configured.");
  }
}

async function saveItem(def: CollectionDef, formData: FormData): Promise<void> {
  const backTo = `/admin/content/${def.slug}`;
  const id = String(formData.get("__id") ?? "").trim();

  const fail = (message: string): never => redirect(`${backTo}?error=${encodeURIComponent(message)}`);

  // ----- build the payload from the registry -----
  const payload: Record<string, unknown> = {};
  for (const field of def.fields) {
    if (field.type === "lines") {
      payload[field.name] = String(formData.get(field.name) ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      continue;
    }

    if (field.type === "number") {
      const parsed = Number(formData.get(field.name) ?? 0);
      payload[field.name] = Number.isFinite(parsed) ? parsed : 0;
      continue;
    }

    if (field.type === "image") {
      let image = "";
      try {
        image = await resolveSubmittedImage(formData, field.name);
      } catch (err) {
        fail(err instanceof Error ? err.message : "The image could not be processed.");
      }
      if (field.required && !image) fail(`“${field.label}” is required.`);
      payload[field.name] = image;
      continue;
    }

    const value = String(formData.get(field.name) ?? "").trim();
    if (field.required && !value) fail(`“${field.label}” is required.`);
    payload[field.name] = value;
  }

  // ----- write -----
  const client = adminClientOrThrow();
  try {
    const result = id
      ? await client.from(def.table).update(payload).eq("id", id)
      : await client.from(def.table).insert(payload);
    if (result.error) {
      fail(`Could not save: ${result.error.message}`);
    }
  } catch (err) {
    if (isRedirectError(err)) throw err;
    fail(err instanceof Error ? err.message : "Could not save the item.");
  }

  revalidatePath("/", "layout");
  redirect(
    `${backTo}?ok=${encodeURIComponent(id ? `${capitalise(def.singular)} updated.` : `${capitalise(def.singular)} added.`)}`,
  );
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Next.js implements `redirect()` by throwing a special error. Re-throw it so
 * redirects are not swallowed by a surrounding try/catch.
 */
function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
