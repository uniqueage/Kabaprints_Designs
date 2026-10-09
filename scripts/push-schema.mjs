#!/usr/bin/env node
/**
 * Push the Kabaprints Supabase schema (migrations + seed) to the live project.
 *
 * Usage:
 *   node scripts/push-schema.mjs
 *
 * Requires these environment variables (Vercel → Environment Variables, or a
 * local .env.local file):
 *   SUPABASE_SERVICE_ROLE_KEY  — the Supabase service role key (server only)
 *   NEXT_PUBLIC_SUPABASE_URL   — https://<project>.supabase.co
 *
 * This script uses the Supabase Management API (POST
 * https://api.supabase.com/v1/projects/{ref}/database/query) authenticated with
 * a Supabase Personal Access Token (PAT) that has `database:write` scope — NOT
 * the service role key. The service role key is used only by the Vercel push
 * route (server-side). To run this script you need a PAT from
 * https://supabase.com/account/tokens (select database:write).
 *
 * The migrations are ordered:
 *   1. supabase/migrations/0001_schema.sql    — tables + enums + indexes
 *   2. supabase/migrations/0002_rls_policies.sql — RLS + policies + auth trigger + storage
 *   3. supabase/migrations/0003_seed.sql     — seed data (idempotent)
 *
 * Each migration is wrapped in a transaction. The seed's VACUUM ANALYZE
 * statements are executed outside the transaction (VACUUM cannot run inside a
 * tx). If any non-VACUUM statement fails the migration is rolled back.
 *
 * NOTE: The seed uses stable UUIDs so re-running is safe (ON CONFLICT DO NOTHING).
 * Tables are created with IF NOT EXISTS, so re-running on an already-provisioned
 * project is also safe (it becomes a no-op).
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const MIGRATIONS_DIR = join(projectRoot, "supabase", "migrations");

// ---------- env ----------
// This script uses the Management API, which authenticates with a Supabase PAT
// (database:write scope), not the service role key.
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = projectUrl
  ? projectUrl.replace(/^https?:\/\/([^.]+)\.supabase\.co$/, "$1")
  : (process.env.SUPABASE_PROJECT_REF ?? null);
const managementToken = process.env.SUPABASE_MANAGEMENT_TOKEN
  ?? process.env.SUPABASE_PAT
  ?? process.env.SUPABASE_ACCESS_TOKEN
  ?? null;

if (!projectUrl || !projectRef || !managementToken) {
  console.error(
    "ERROR: Missing environment variables.\n" +
      "Set these before running this script:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co\n" +
      "  SUPABASE_MANAGEMENT_TOKEN=<Supabase PAT with database:write scope>\n" +
      "     (or SUPABASE_PAT / SUPABASE_ACCESS_TOKEN)\n" +
      "You can put them in a .env.local file (gitignored) or in your shell.\n" +
      "Get a PAT at https://supabase.com/account/tokens (select database:write).\n"
  );
  process.exit(1);
}

if (!projectUrl.includes(".supabase.co")) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL does not look like a Supabase project URL:", projectUrl);
  process.exit(1);
}

const mgmtBase = `https://api.supabase.com/v1/projects/${projectRef}`;

// ---------- helpers ----------
function loadMigration(name) {
  return readFileSync(join(MIGRATIONS_DIR, name), "utf8");
}

function migrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((n) => n.endsWith(".sql"))
    .sort();
}

/**
 * Split a migration body into:
 *   - txBody: the part to run inside BEGIN..COMMIT (everything except VACUUM)
 *   - vacuumStmts: the VACUUM ANALYZE statements (run separately, outside tx)
 *
 * VACUUM cannot run inside a transaction block, so we peel those statements out.
 */
function splitVacuum(raw) {
  const lines = raw.split("\n");
  const txLines = [] ;
  const vacuumLines = [] ;
  let inVacuum = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toUpperCase().startsWith("VACUUM")) {
      inVacuum = true;
      vacuumLines.push(line);
    } else if (inVacuum && trimmed === "") {
      // keep a blank line separator in the vacuum block
      vacuumLines.push(line);
    } else if (inVacuum && trimmed && !trimmed.toUpperCase().startsWith("VACUUM")) {
      // end of vacuum block
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

async function runQuery(sql, label) {
  console.log(`▶ Running: ${label}`);
  try {
    const res = await fetch(`${mgmtBase}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${managementToken}`,
        "Content-Type": "application/json",
        "Prefer": "wait=true",
      },
      body: JSON.stringify({ query: sql }),
    });
    const body = await res.text().catch(() => "");
    if (!res.ok) {
      console.error(`✖ FAILED: ${label}`);
      console.error(`  HTTP ${res.status}: ${body.slice(0, 800)}`);
      return false;
    }
    console.log(`  ✓ ${label} (${res.status})`);
    return true;
  } catch (e) {
    console.error(`✖ FAILED: ${label}`);
    console.error(`  ${e.message}`);
    return false;
  }
}

// ---------- main ----------
async function main() {
  console.log(`✦ Kabaprints schema push (Management API)`);
  console.log(`  Project:      ${projectUrl} (ref: ${projectRef})`);
  console.log(`  Migrations:   ${MIGRATIONS_DIR}`);
  console.log(`  Files:        ${migrationFiles().join(", ")}`);
  console.log();

  const files = migrationFiles();
  if (files.length === 0) {
    console.error("No .sql migration files found in", MIGRATIONS_DIR);
    process.exit(1);
  }

  for (const name of files) {
    const raw = loadMigration(name);
    const { txBody, vacuumStmts } = splitVacuum(raw);

    // Run the transactional portion.
    const ok = await runQuery(`BEGIN;\n${txBody}\nCOMMIT;`, name);
    if (!ok) {
      console.error(`\n⛔ Migration ${name} failed. Stopping.`);
      process.exit(1);
    }

    // Run VACUUM statements outside the transaction (if any).
    if (vacuumStmts.length) {
      console.log(`  → Running ${vacuumStmts.length} VACUUM statement(s) outside tx...`);
      for (const stmt of vacuumStmts) {
        const vok = await runQuery(stmt, `VACUUM (${name})`);
        if (!vok) {
          console.error(`\n⚠ VACUUM in ${name} failed (non-fatal):`, stmt.slice(0, 80));
        }
      }
    }
  }

  // ---------- verify ----------
  console.log();
  console.log(`✦ Verifying provisioned objects...`);
  const checks = [
    ["public.services count", "SELECT COUNT(*) AS c FROM public.services"],
    ["public.products count", "SELECT COUNT(*) AS c FROM public.products"],
    ["public.hero_slides count", "SELECT COUNT(*) AS c FROM public.hero_slides"],
    ["public.testimonials count", "SELECT COUNT(*) AS c FROM public.testimonials"],
    ["public.portfolio_works count", "SELECT COUNT(*) AS c FROM public.portfolio_works"],
    ["public.before_after count", "SELECT COUNT(*) AS c FROM public.before_after"],
    ["public.site_settings rows", "SELECT COUNT(*) AS c FROM public.site_settings"],
    ["storage.buckets", "SELECT id, name, public FROM storage.buckets ORDER BY id"],
    ["profiles table exists", "SELECT COUNT(*) AS c FROM public.profiles"],
    ["orders table exists", "SELECT COUNT(*) AS c FROM public.orders"],
  ];

  for (const [label, sql] of checks) {
    try {
      const res = await fetch(`${mgmtBase}/database/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${managementToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql }),
      });
      const rows = await res.json().catch(() => []);
      const val = Array.isArray(rows) && rows.length ? rows[0] : rows;
      console.log(`  ✓ ${label}: ${JSON.stringify(val)}`);
    } catch (e) {
      console.log(`  ? ${label}: could not verify (${e.message})`);
    }
  }

  console.log();
  console.log("✦ Schema push complete.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
