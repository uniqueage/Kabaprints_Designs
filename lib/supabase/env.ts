import { z } from "zod";

/**
 * Supabase environment validation for Kabaprints.
 *
 * Required env vars (set in Vercel → Project Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL        — https://<project>.supabase.co   (public)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   — anon key (public; safe for browser)
 *   SUPABASE_SERVICE_ROLE_KEY       — service role key (server only)
 *
 * The anon key is public by design: it is paired with Row Level Security
 * policies so browser clients read public catalog data and write only their
 * own orders/uploads. Admin mutations use the service role key on the server.
 *
 * IMPORTANT: the two public vars and the server-only secret are validated
 * SEPARATELY. Next.js only inlines `NEXT_PUBLIC_*` into the browser bundle, so
 * the service role key is never available to client code. If the public config
 * were validated together with the secret (as it once was), every browser call
 * would fail its check and report "Supabase is not configured" even when the
 * public vars are set correctly.
 */

// ---------- public, browser-safe configuration ----------
const publicSchema = z.object({
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
});

export type SupabasePublicEnv = z.infer<typeof publicSchema>;

// Resolved once at module load. Contains only public values, so this object is
// safe to use in the browser and in server code alike.
let _publicEnv: SupabasePublicEnv | null = null;

try {
  _publicEnv = publicSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  });
} catch {
  _publicEnv = null;
}

if (!_publicEnv) {
  // Safe configuration check: reports only *which* variables are missing or
  // invalid. It never prints the value of any variable.
  console.warn(
    `[kabaprints] Supabase public env incomplete (${describePublicEnvProblem()}). ` +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → " +
      "Project Settings → Environment Variables, then redeploy."
  );
}

/** The validated public env (URL + anon key), or null when not configured. */
export function getSupabaseEnv(): SupabasePublicEnv | null {
  return _publicEnv;
}

/** True when the public Supabase configuration (URL + anon key) is present. */
export function isSupabaseConfigured(): boolean {
  return _publicEnv !== null;
}

/**
 * Server-only service role key.
 *
 * Read lazily at call time so it is resolved only in the Node/Edge server
 * runtime. It is never inlined into the browser bundle (Next.js only inlines
 * `NEXT_PUBLIC_*`) and is never logged. Returns null when unset or blank.
 */
export function getSupabaseServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return key && key.trim().length > 0 ? key : null;
}

/**
 * Presence-only view of the Supabase configuration.
 *
 * Contains booleans only — never a URL, key, or token value — so it is safe to
 * log or to return from a health/diagnostic endpoint.
 */
export function getSupabaseConfigStatus(): {
  url: boolean;
  anonKey: boolean;
  serviceRoleKey: boolean;
} {
  return {
    url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

function describePublicEnvProblem(): string {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return missing.length ? `missing: ${missing.join(", ")}` : "value present but invalid";
}
