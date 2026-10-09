import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

// Minimal cookie serialize option shape (subset of the `cookie` package's
// SerializeOptions). Avoids adding a dependency for a small helper.
export interface CookieSerializeOptions {
  path?: string;
  maxAge?: number;
  expires?: Date;
  domain?: string;
  sameSite?: "strict" | "lax" | "none" | boolean;
  secure?: boolean;
  httpOnly?: boolean;
}

/**
 * Kabaprints Supabase client factory.
 *
 * Two tiers:
 *  - Browser/SSR client (anon key) — used by React components and server
 *    components that render user-facing catalog data and perform per-user
 *    mutations (orders, uploads). Auth/session is handled by @supabase/ssr.
 *  - Admin client (service role key) — server only, used for catalog CRUD
 *    and privileged operations. Never sent to the browser.
 *
 * Public catalog tables have SELECT policies that allow anonymous reads, so
 * the anon client can render the site without a signed-in user.
 *
 * NOTE: This app does not yet wire a full auth flow into the site UI (sign-in
 * is a client-side demo). When you do wire Supabase Auth, set up a Next.js
 * middleware that calls createServerClient with getAll/setAll and inserts the
 * auth cookies. The helpers below are ready for that.
 */

/**
 * Return a server-side Supabase client using the anon key.
 *
 * `cookies` must implement `getAll` and, for token-refresh correctness,
 * `setAll`. In a middleware-less setup you can pass a minimal `getAll` that
 * reads from a Headers object; token refreshes will then emit a warning but
 * reads still work.
 */
export function createSupabaseServerClient(getCookies: () => Headers) {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables."
    );
  }

  const headers = getCookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: async () => {
        const out: { name: string; value: string }[] = [];
        headers.forEach((value, name) => {
          if (name === "cookie") {
            value.split(";").forEach((part) => {
              const eq = part.indexOf("=");
              if (eq > 0) {
                out.push({ name: part.slice(0, eq).trim(), value: part.slice(eq + 1).trim() });
              }
            });
          }
        });
        return out;
      },
      setAll: async (cookies, responseHeaders) => {
        // The Supabase client expects us to apply the cookies to the response.
        // In middleware-less server components we can't reliably write back to
        // the HTTP response, so we store them in a mutable Headers object that
        // the caller can apply. In a real Next.js middleware you would call
        // response.cookies.set(...) for each and also apply responseHeaders.
        const cookieHeaderParts: string[] = [];
        cookies.forEach(({ name, value, options }) => {
          const serialized = serializeCookie(name, value, options);
          cookieHeaderParts.push(serialized);
        });
        if (cookieHeaderParts.length) {
          const existing = headers.get("Set-Cookie");
          headers.set(
            "Set-Cookie",
            existing ? `${existing}; ${cookieHeaderParts.join("; ")}` : cookieHeaderParts.join("; ")
          );
        }
        // Apply response headers (Cache-Control etc.)
        Object.entries(responseHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
      },
    },
  });
}

/**
 * Serialize a single cookie value in a Node-safe way. Prefer the `cookie`
 * package in production; this is a minimal stand-in so the client builds
 * without extra dependencies.
 */
function serializeCookie(name: string, value: string, options: CookieSerializeOptions): string {
  const parts: string[] = [encodeURIComponent(name), "=", encodeURIComponent(String(value))];
  if (options.path) parts.push(`; Path=${options.path}`);
  if (options.maxAge != null) parts.push(`; Max-Age=${options.maxAge}`);
  if (options.expires != null) parts.push(`; Expires=${options.expires.toUTCString()}`);
  if (options.domain) parts.push(`; Domain=${options.domain}`);
  if (options.sameSite) parts.push(`; SameSite=${options.sameSite}`);
  if (options.secure) parts.push(`; Secure`);
  if (options.httpOnly) parts.push(`; HttpOnly`);
  return parts.join("");
}

/**
 * Return a browser Supabase client. Use only inside Client Components and
 * browser utility code. Cookies are read/written directly against document.cookie.
 */
export function createSupabaseBrowserClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables."
    );
  }
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Bare client (no cookie handling). For quick server-side reads without session
 * awareness, e.g. static build-time checks or admin reads via the anon key.
 */
export function createSupabaseClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables."
    );
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Admin client (service role key) — server only. Grants full access subject
 * only to RLS policies where the role check passes, plus storage admin rights.
 * Never import or send this to the browser.
 */
export function createSupabaseAdminClient() {
  const env = getSupabaseEnv();
  if (!env || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables (server only)."
    );
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export { isSupabaseConfigured };
