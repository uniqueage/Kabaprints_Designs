/**
 * POST /api/supabase/push
 *
 * Triggers a one-time push of the Kabaprints Supabase schema (tables, RLS,
 * storage buckets, auth trigger, seed data) to the live project. This route
 * runs server-side only and uses Vercel environment variables.
 *
 * ENVIRONMENT VARIABLES (set in Vercel → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL       — https://<project>.supabase.co (public)
 *   SUPABASE_SERVICE_ROLE_KEY      — service role key (server only; used by
 *                                    the admin section and as a "project
 *                                    configured" signal for this route)
 *   SUPABASE_PUSH_SECRET           — shared secret that gates this endpoint
 *                                    (set in Vercel; passed as a request header
 *                                    when calling the route)
 *   SUPABASE_PUSH_TOKEN            — a Supabase Personal Access Token (PAT)
 *                                    with `database:write` scope (create at
 *                                    https://supabase.com/account/tokens).
 *                                    Required for this route to execute SQL via
 *                                    the Supabase Management API. The service
 *                                    role key cannot call the Management API, so
 *                                    a PAT is required.
 *
 * The migration SQL is inlined at build time (see migrations-bundle.ts) so the
 * deployed function does not depend on the filesystem at runtime.
 *
 * WHY THE MANAGEMENT API:
 *   - There is no supported "execute arbitrary SQL" endpoint reachable with the
 *     service role key over the project's REST API (/rest/v1/sql is not a valid
 *     PostgREST endpoint on this project).
 *   - The Supabase Management API (POST
 *     https://api.supabase.com/v1/projects/{ref}/database/query) is the
 *     supported way to run SQL over HTTP, and it authenticates with a Supabase
 *     PAT (database:write), not the service role key.
 *
 * SECURITY:
 *  - The endpoint is protected by a shared secret header
 *    `x-supabase-push-secret` whose value you set in Vercel as the env var
 *    SUPABASE_PUSH_SECRET (and as a request header when you call it).
 *  - Without a matching secret the endpoint returns 401. If
 *    SUPABASE_PUSH_SECRET is not configured at all, execution is refused with
 *    503 — configuring a token alone never makes this route runnable.
 *  - The PAT and service role key never leave the server.
 *  - The response includes a summary but never the raw keys.
 *
 * Usage (after deploying to Vercel and setting SUPABASE_PUSH_SECRET +
 * SUPABASE_PUSH_TOKEN):
 *   curl -X POST https://<your-vercel-url>/api/supabase/push \
 *     -H "x-supabase-push-secret: <SUPABASE_PUSH_SECRET value>" \
 *     -H "Content-Type: application/json" \
 *     -d '{}'
 *
 * After a successful push you can run the verification:
 *   node scripts/verify-project.mjs
 *
 * IMPORTANT: A Supabase PAT with database:write grants broad administrative
 * access to your project. Do NOT expose it to the browser. This route is
 * server-side only and is gated by the secret header.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv, getSupabaseConfigStatus, isSupabaseConfigured } from "@/lib/supabase/env";
import { MIGRATION_FILES, MIGRATIONS } from "./migrations-bundle";

const MIGRATIONS_DIR = ""; // unused; SQL is inlined

function loadMigration(name: string): string {
  const migration = MIGRATIONS.find((m) => m.name === name);
  if (!migration) throw new Error(`Unknown migration: ${name}`);
  return migration.sql;
}

function migrationFiles(): string[] {
  return MIGRATION_FILES;
}

/**
 * Extract a project ref from the Supabase project URL.
 * https://<ref>.supabase.co -> <ref>
 */
function projectRefFromUrl(url: string): string {
  const m = url.match(/^https?:\/\/([^.]+)\.supabase\.co$/);
  if (!m) throw new Error(`NEXT_PUBLIC_SUPABASE_URL does not look like a Supabase project URL: ${url}`);
  return m[1]!;
}

/**
 * Split a migration body into the transactional portion and any VACUUM
 * statements. VACUUM cannot run inside a transaction block, so we peel those
 * statements out and execute them separately after the transaction commits.
 */
function splitVacuum(raw: string): { txBody: string; vacuumStmts: string[] } {
  const lines = raw.split("\n");
  const txLines: string[] = [];
  const vacuumLines: string[] = [];
  let inVacuum = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toUpperCase().startsWith("VACUUM")) {
      inVacuum = true;
      vacuumLines.push(line);
    } else if (inVacuum && trimmed === "") {
      vacuumLines.push(line);
    } else if (inVacuum && trimmed && !trimmed.toUpperCase().startsWith("VACUUM")) {
      inVacuum = false;
      txLines.push(line);
    } else {
      txLines.push(line);
    }
  }
  const txBody = txLines.join("\n").trim();
  const vacuumStmts = vacuumLines
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  return { txBody, vacuumStmts };
}

async function execSql(
  mgmtBase: string,
  token: string,
  sql: string
): Promise<{ ok: boolean; body: string }> {
  const res = await fetch(`${mgmtBase}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=true",
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text().catch(() => "");
  return { ok: res.ok, body: text.slice(0, 800) };
}

async function pushSchema(
  mgmtBase: string,
  token: string
): Promise<{
  success: boolean;
  steps: Array<{ name: string; ok: boolean; detail: string }>;
  counts: Record<string, number>;
}> {
  const files = migrationFiles();
  const steps: Array<{ name: string; ok: boolean; detail: string }> = [];

  for (const name of files) {
    const raw = loadMigration(name);
    const { txBody, vacuumStmts } = splitVacuum(raw);

    // Transactional portion.
    const tx = `BEGIN;\n${txBody}\nCOMMIT;`;
    const { ok, body } = await execSql(mgmtBase, token, tx);
    steps.push({ name, ok, detail: ok ? "ok" : body });
    if (!ok) break;

    // VACUUM statements run outside the transaction (non-fatal if they fail).
    if (vacuumStmts.length > 0) {
      for (const stmt of vacuumStmts) {
        if (stmt.trim().length === 0) continue;
        const vOk = await execSql(mgmtBase, token, stmt);
        if (!vOk.ok) {
          steps.push({ name: `${name} (VACUUM)`, ok: false, detail: vOk.body });
        } else {
          steps.push({ name: `${name} (VACUUM)`, ok: true, detail: "ok" });
        }
      }
    }
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
      const { ok, body } = await execSql(mgmtBase, token, sql);
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

function getPushToken(): string | null {
  // The Management API requires a Supabase PAT (database:write). The service
  // role key cannot call it, so we require a PAT.
  return process.env.SUPABASE_PUSH_TOKEN ?? null;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.",
      },
      { status: 503 }
    );
  }

  const env = getSupabaseEnv()!;
  const token = getPushToken();

  if (!token) {
    return NextResponse.json(
      {
        error: "Supabase push is not configured for execution. Set SUPABASE_PUSH_TOKEN (a Supabase Personal Access Token with database:write scope) in Vercel environment variables. Create one at https://supabase.com/account/tokens.",
      },
      { status: 503 }
    );
  }

  // This endpoint runs arbitrary SQL with a Management API token, so it must
  // never be executable without the shared secret. Refuse outright when the
  // secret is missing rather than falling back to "open" — otherwise adding
  // SUPABASE_PUSH_TOKEN alone would expose a schema-running endpoint to anyone
  // who knows the URL.
  const configuredSecret = process.env.SUPABASE_PUSH_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      {
        error:
          "Refusing to execute: SUPABASE_PUSH_SECRET is not set. Set it in Vercel → Project Settings → Environment Variables, then call this route with the matching x-supabase-push-secret header.",
      },
      { status: 503 }
    );
  }

  const secret = request.headers.get(PUSH_SECRET_HEADER);
  if (secret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let projectRef: string;
  try {
    projectRef = projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Configuration error",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  const mgmtBase = `https://api.supabase.com/v1/projects/${projectRef}`;

  try {
    const result = await pushSchema(mgmtBase, token);

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
      {
        error: "Internal error",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        message: "Supabase public env not set.",
        // Presence-only booleans — no URL, key or token value is ever exposed.
        envStatus: getSupabaseConfigStatus(),
      },
      { status: 503 }
    );
  }
  const env = getSupabaseEnv()!;
  const pushToken = getPushToken();
  return NextResponse.json({
    configured: true,
    projectUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    // Presence-only booleans — safe to expose; never contains credential values.
    envStatus: getSupabaseConfigStatus(),
    pushTokenConfigured: !!pushToken,
    environment: process.env.SUPABASE_PUSH_SECRET
      ? "gated"
      : "open (no SUPABASE_PUSH_SECRET set — execution is refused)",
    executionReady: !!pushToken && !!process.env.SUPABASE_PUSH_SECRET,
    note: !pushToken
      ? "Add SUPABASE_PUSH_TOKEN (Supabase PAT, database:write) to execute."
      : !process.env.SUPABASE_PUSH_SECRET
        ? "Add SUPABASE_PUSH_SECRET to enable execution."
        : "Ready to execute.",
  });
}
