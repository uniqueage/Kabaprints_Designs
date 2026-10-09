import { z } from "zod";

/**
 * Supabase environment validation for Kabaprints.
 *
 * Required env vars (set in Vercel → Project Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL        — https://<project>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   — anon key (public; safe for browser)
 *   SUPABASE_SERVICE_ROLE_KEY       — service role key (server only)
 *
 * The anon key is public by design: it is paired with Row Level Security
 * policies so browser clients read public catalog data and write only their
 * own orders/uploads. Admin mutations use the service role key on the server.
 */
const required = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .refine(
      (u) => u.startsWith("https://") && u.includes(".supabase.co"),
      "NEXT_PUBLIC_SUPABASE_URL must be a Supabase project URL (https://<ref>.supabase.co)"
    ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required (server only)"),
});

export const supabaseEnv = required;

let _env: z.infer<typeof required> | null = null;

try {
  _env = required.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  });
} catch (err) {
  console.warn(
    "[kabaprints] Supabase env incomplete — clients will error until "
    + "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and "
    + "SUPABASE_SERVICE_ROLE_KEY are set."
  );
}

export function getSupabaseEnv() {
  return _env;
}

export function isSupabaseConfigured(): boolean {
  return _env !== null && Boolean(_env.NEXT_PUBLIC_SUPABASE_URL);
}
