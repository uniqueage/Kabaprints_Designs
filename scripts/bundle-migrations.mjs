#!/usr/bin/env node
/**
 * Bundle supabase/migrations/*.sql into app/api/supabase/push/migrations-bundle.ts.
 *
 * The Vercel route handler cannot read files from disk at runtime, so the SQL
 * is inlined into a TypeScript module at build time.
 *
 * Usage:
 *   node scripts/bundle-migrations.mjs
 *
 * Run this after adding or editing any file in supabase/migrations/.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const migrationsDir = join(projectRoot, "supabase", "migrations");
const outFile = join(projectRoot, "app", "api", "supabase", "push", "migrations-bundle.ts");

/** Escape a SQL body so it can live inside a template literal. */
function escapeSql(sql) {
  return sql.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No .sql migrations found in", migrationsDir);
  process.exit(1);
}

const parts = [
  "// Auto-generated migration SQL (inlined at build time so the Vercel",
  "// function does not depend on the filesystem at runtime.)",
  "// Regenerate by running: node scripts/bundle-migrations.mjs",
  "// Source of truth: supabase/migrations/*.sql",
  "//",
  "// NOTE: some migrations contain VACUUM ANALYZE statements which cannot run",
  "// inside a transaction. Runners that wrap each migration in BEGIN..COMMIT must",
  "// execute the VACUUM statements outside the transaction (see push-schema.mjs",
  "// and the Vercel push route).",
  "",
];

for (const name of files) {
  const sql = readFileSync(join(migrationsDir, name), "utf8");
  const identifier = `MIGRATION_${name.replace(/\.sql$/, "")}_sql`;
  parts.push(`export const ${identifier} = \`${escapeSql(sql)}\`;`);
  parts.push("");
}

parts.push("/** Ordered list of the bundled migrations. */");
parts.push(
  "export const MIGRATIONS: { name: string; sql: string }[] = [",
);
for (const name of files) {
  const identifier = `MIGRATION_${name.replace(/\.sql$/, "")}_sql`;
  parts.push(`  { name: ${JSON.stringify(name)}, sql: ${identifier} },`);
}
parts.push("];");
parts.push("");
parts.push("/** Names of the bundled migrations, in order. */");
parts.push("export const MIGRATION_FILES: string[] = MIGRATIONS.map((m) => m.name);");
parts.push("");

writeFileSync(outFile, parts.join("\n"), "utf8");
console.log(`Bundled ${files.length} migration(s) into ${outFile}`);
console.log(`  ${files.join("\n  ")}`);
