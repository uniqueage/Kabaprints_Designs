/**
 * POST /api/supabase/push
 *
 * Triggers a one-time push of the Kabaprints Supabase schema (tables, RLS,
 * storage buckets, auth trigger, seed data) to the live project. This route
 * runs server-side only and uses the Vercel environment variables:
 *
 *   SUPABASE_SERVICE_ROLE_KEY  (server only)
 *   NEXT_PUBLIC_SUPABASE_URL   (public)
 *
 * This is the recommended activation path when you DO NOT have the service
 * role key in your local shell: deploy the site to Vercel first (so the env
 * vars are available), then call this endpoint once to provision the project.
 *
 * SECURITY:
 *  - The endpoint is protected by a shared secret header
 *    `x-supabase-push-secret` whose value you set in Vercel as the env var
 *    SUPABASE_PUSH_SECRET (and as a request header when you call it).
 *  - Without matching that secret the endpoint returns 401.
 *  - The service role key never leaves the server.
 *  - The response includes a summary but never the raw keys.
 *
 * Usage (after deploying to Vercel and setting SUPABASE_PUSH_SECRET):
 *   curl -X POST https://<your-vercel-url>/api/supabase/push \
 *     -H "x-supabase-push-secret: <SUPABASE_PUSH_SECRET value>" \
 *     -H "Content-Type: application/json" \
 *     -d '{}'
 *
 * After a successful push you can run the verification:
 *   node scripts/verify-project.mjs
 *
 * IMPORTANT: The service role key grants full administrative access to your
 * Supabase project. Do NOT expose it to the browser. This route is
 * server-side only and is gated by the secret header.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// The migrations live at <project-root>/supabase/migrations. In a Vercel build
// the function root is <project-root>/.next/standalone OR the build output
// dir; __dirname for this route resolves to …/.next/server/app/api/supabase/push/route.js
// (or the standalone equivalent). Walk up to the project root by locating the
// supabase/migrations dir.
function findMigrationsDir() {
  // Start from the route's own dir and walk up, looking for supabase/migrations.
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir, "supabase", "migrations");
    try {
      const entries = readdirSync(candidate);
      if (entries.some((n) => n.endsWith(".sql"))) {
        return candidate;
      }
    } catch {
      // not here
    }
    dir = join(dir, "..");
  }
  // Fallback: relative to __dirname (works when the route sits next to the
  // built output that preserves the repo layout, e.g. some dev/standalone setups).
  return join(__dirname, "../../../../supabase/migrations");
}

const MIGRATIONS_DIR = findMigrationsDir();

function loadMigration(name: string) {
  return readFileSync(join(MIGRATIONS_DIR, name), "utf8");
}

function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR).filter((n) => n.endsWith(".sql")).sort();
}

async function execSql(url: string, serviceRoleKey: string, sql: string): Promise<{ ok: boolean; body: string }> {
  const res = await fetch(`${url}/rest/v1/sql`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "wait=true",
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text().catch(() => "");
  return { ok: res.ok, body: text.slice(0, 800) };
}

async function pushSchema(url: string, serviceRoleKey: string): Promise<{ success: boolean; steps: Array<{ name: string; ok: boolean; detail: string }>; counts: Record<string, number> }> {
  const files = migrationFiles();
  const steps: Array<{ name: string; ok: boolean; detail: string }> = [];

  for (const name of files) {
    const raw = loadMigration(name);
    const tx = `BEGIN;\n${raw}\nCOMMIT;`;
    const { ok, body } = await execSql(url, serviceRoleKey, tx);
    steps.push({ name, ok, detail: ok ? "ok" : body });
    if (!ok) break;
  }

  const counts: Record<string, number> = {};
  const countQueries: Array<[string, string]> = [
    ["services", "SELECT COUNT(*) AS c FROM public.services"],
    ["products", "SELECT COUNT(*) AS c FROM public.products"],
    ["hero_slides", "SELECT COUNT(*) AS c FROM public.hero_slides"],
    ["testimonials", "SELECT COUNT(*) AS c FROM public.testimonials"],
    ["portfolio_works", "SELECT COUNT(*) AS c FROM public.portfolio_works"],
    ["before_after", "SELECT COUNT(*) AS c FROM public.before_after"],
    ["site_settings", "SELECT COUNT(*) AS c FROM public.site_settings"],
    ["orders", "SELECT COUNT(*) AS c FROM public.orders"],
    ["design_uploads", "SELECT COUNT(*) AS c FROM public.design_uploads"],
  ];

  for (const [label, sql] of countQueries) {
    try {
      const { ok, body } = await execSql(url, serviceRoleKey, sql);
      if (ok) {
        try {
          const rows = JSON.parse(body);
          counts[label] = Array.isArray(rows) && rows.length ? Number(rows[0].c) : 0;
        } catch {
          counts[label] = -1;
        }
      } else {
        counts[label] = -1;
      }
    } catch {
      counts[label] = -1;
    }
  }

  return { success: steps.every((s) => s.ok), steps, counts };
}

const PUSH_SECRET_HEADER = "x-supabase-push-secret";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables." },
      { status: 503 }
    );
  }

  const env = getSupabaseEnv()!;
  const secret = request.headers.get(PUSH_SECRET_HEADER);

  if (process.env.SUPABASE_PUSH_SECRET && secret !== process.env.SUPABASE_PUSH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pushSchema(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    return NextResponse.json(
      {
        ok: result.success,
        message: result.success
          ? "Schema provisioned successfully."
          : "Schema push completed with errors. Check steps.",
        steps: result.steps.map((s) => ({ file: s.name, ok: s.ok, detail: s.detail })),
        counts: result.counts,
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, message: "Supabase env not set." }, { status: 503 });
  }
  const env = getSupabaseEnv()!;
  return NextResponse.json({
    configured: true,
    projectUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    environment: process.env.SUPABASE_PUSH_SECRET ? "gated" : "open (no SUPABASE_PUSH_SECRET set — not recommended for production)",
  });
}
