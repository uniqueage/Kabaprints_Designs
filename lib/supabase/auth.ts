/**
 * Server-side auth helpers for the Kabaprints admin section.
 *
 * These run on the server only. They use the anon client with the current
 * request's auth cookies (via createServerClient + next/headers cookies).
 * The service role key is never used for auth — we identify the user via
 * Supabase Auth, then check their `profiles.role` row.
 *
 * The admin section is gated on `profile.role === 'admin'`.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";
import type { Profile } from "@/supabase/lib/types";

async function supabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.",
    );
  }
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

export async function getCurrentSession() {
  const client = await supabaseServerClient();
  const { data: { session } } = await client.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const client = await supabaseServerClient();
  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) return null;
  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }
  return profile as Profile | null;
}

/**
 * Make the current signed-in user an admin (sets profiles.role = 'admin').
 *
 * Intended for one-time bootstrapping. In production you would typically set the
 * role from the Supabase Dashboard. This helper is guarded: it only succeeds if
 * the caller is already signed in.
 */
export async function promoteCurrentUserToAdmin() {
  const profile = await getCurrentUser();
  if (!profile) {
    return { error: "You must be signed in first." };
  }
  if (profile.role === "admin") {
    return { error: null, alreadyAdmin: true };
  }
  const client = await supabaseServerClient();
  const { error } = await client
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", profile.id);
  if (error) {
    return { error: `Failed to promote: ${error.message}` };
  }
  return { error: null, alreadyAdmin: false };
}
