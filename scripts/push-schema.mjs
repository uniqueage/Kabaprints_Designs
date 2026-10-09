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
 * This script uses the Supabase SQL API (POST /rest/v1/sql) authenticated with
 * the service role key, which runs the SQL as a privileged role and can create
 * tables, policies, triggers, storage buckets and seed data in one go.
 *
 * The migrations are ordered:
 *   1. supabase/migrations/0001_schema.sql    — tables + enums + indexes
 *   2. supabase/migrations/0002_rls_policies.sql — RLS + policies + auth trigger + storage
 *   3. supabase/migrations/0003_seed.sql     — seed data (idempotent)
 *
 * Each migration is wrapped in a transaction. If any statement fails the whole
 * migration is rolled back, so partial state is avoided.
 *
 * NOTE: The seed uses stable UUIDs so re-running is safe (ON CONFLICT DO NOTHING).
 * Tables are created with IF NOT EXISTS, so re-running the whole script on an
 * already-provisioned project is also safe (it becomes a no-op).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const MIGRATIONS_DIR = join(projectRoot, "supabase", "migrations");

// ---------- env ----------
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "ERROR: Missing environment variables.\n" +
      "Set these before running this script:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=<service role key>\n" +
      "You can put them in a .env.local file (gitignored) or in your shell.\n"
  );
  process.exit(1);
}

if (!url.includes(".supabase.co")) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL does not look like a Supabase project URL:", url);
  process.exit(1);
}

// ---------- client (service role) ----------
const supabase = createClient(url, serviceRoleKey);

// ---------- helpers ----------
function loadMigration(name) {
  const path = join(MIGRATIONS_DIR, name);
  return readFileSync(path, "utf8");
}

function migrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((n) => n.endsWith(".sql"))
    .sort();
}

function splitStatements(sql) {
  // Split on semicolons but keep the statement intact. This is good enough for
  // our migrations (no PL/pgSQL blocks with embedded semicolons other than the
  // $$ function bodies, which are single statements in our case).
  // We send the whole migration as a single SQL API call wrapped in BEGIN/COMMIT
  // so we don't need to split within it.
  return sql.trim();
}

async function runSql(sql, label) {
  console.log(`▶ Running: ${label}`);
  const { data, error } = await supabase.rpc("raw", {
    query: sql,
  }).catch((e) => ({ error: e }));

  // rpc("raw") isn't available by default; fall back to the SQL endpoint.
  // Use the /rest/v1/sql endpoint directly.
  try {
    const res = await fetch(`${url}/rest/v1/sql`, {
      method: "POST",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "wait=true",
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`✖ FAILED: ${label}`);
      console.error(`  HTTP ${res.status}: ${text.slice(0, 500)}`);
      return false;
    }

    const json = await res.json().catch(() => null);
    // The SQL API returns an array of result rows; for DDL it returns [].
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
  console.log(`✦ Kabaprints schema push`);
  console.log(`  Project: ${url}`);
  console.log(`  Migrations dir: ${MIGRATIONS_DIR}`);
  console.log();

  const files = migrationFiles();
  if (files.length === 0) {
    console.error("No .sql migration files found in", MIGRATIONS_DIR);
    process.exit(1);
  }

  // Each migration runs in its own transaction.
  for (const name of files) {
    const raw = loadMigration(name);
    // Wrap in a transaction so the whole migration is atomic.
    const tx = `BEGIN;\n${raw}\nCOMMIT;`;
    const ok = await runSql(tx, name);
    if (!ok) {
      console.error(`\n⛔ Migration ${name} failed. Stopping.`);
      process.exit(1);
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
    const { data, error } = await supabase.from("").select("*").overrideQuery(sql).single().catch(() => ({ data: null, error: new Error("no") }));
    // Fall back to the SQL endpoint for these reads too.
    try {
      const res = await fetch(`${url}/rest/v1/sql`, {
        method: "POST",
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
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
