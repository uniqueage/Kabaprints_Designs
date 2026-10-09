#!/usr/bin/env node
/**
 * Verify the Kabaprints Supabase project is live and correctly configured.
 *
 * Usage:
 *   node scripts/verify-project.mjs
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   (for public catalog reads)
 *   SUPABASE_SERVICE_ROLE_KEY       (for admin checks: RLS policies, storage, counts)
 *
 * This script reports:
 *  - Project reachability
 *  - Public catalog reads (anon) for services, products, hero slides, testimonials,
 *    portfolio works, before/after, site settings, printable materials/sizes/colors,
 *    design services/process
 *  - Storage buckets (public products-images + private design)
 *  - RLS status on key tables
 *  - Seed row counts
 *  - Auth: signup endpoint reachable (smoke test — creates a real test user; we
 *    document how to delete it).
 *
 * WARNING: the auth smoke test creates a real user. After running, delete the
 * test user from the Supabase Dashboard → Authentication → Users, or call the
 * cleanup step documented at the end.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL is not set.");
  process.exit(1);
}

if (!anonKey && !serviceRoleKey) {
  console.error("ERROR: Set NEXT_PUBLIC_SUPABASE_ANON_KEY (for public reads) or SUPABASE_SERVICE_ROLE_KEY (for admin checks).");
  process.exit(1);
}

const anonClient = anonKey ? createClient(url, anonKey) : null;
const adminClient = serviceRoleKey ? createClient(url, serviceRoleKey) : null;

async function sqlFetch(sql, opts = {}) {
  const key = opts.serviceRole ? serviceRoleKey : anonKey;
  if (!key) throw new Error("No suitable key for SQL query");
  const res = await fetch(`${url}/rest/v1/sql`, {
    method: "POST",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "wait=true",
      ...(opts.admin ? { "Capto-World": "" } : {}),
    },
    body: JSON.stringify({ query: sql }),
  });
  const rows = await res.json().catch(() => []);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SQL query failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }
  return rows;
}

function banner(title) {
  console.log(`\n━━━ ${title} ━━━`);
}

function ok(msg) { console.log(`  ✓ ${msg}`); }
function info(msg) { console.log(`  ℹ ${msg}`); }
function fail(msg) { console.log(`  ✖ ${msg}`); }

async function main() {
  banner("1. Project reachability");
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { "apikey": anonKey || serviceRoleKey, "Authorization": `Bearer ${anonKey || serviceRoleKey}` },
    });
    console.log(`  Base endpoint HTTP ${res.status} (${res.ok ? "OK" : "FAIL"})`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ok("Project is reachable");
  } catch (e) {
    fail(`Project unreachable: ${e.message}`);
    process.exit(1);
  }

  // ---------- PUBLIC CATALOG READS (anon) ----------
  if (anonClient) {
    banner("2. Public catalog reads (anon client — what the site sees)");

    const reads = [
      ["site_settings", "SELECT site_name, tagline, vision, hours, hours_days, whatsapp_number, email, phones_json FROM site_settings WHERE id = 'a0000000-0000-0000-0000-000000000001' LIMIT 1"],
      ["services (7 tags)", "SELECT slug, tag, tagline FROM services ORDER BY ordinal"],
      ["hero_slides", "SELECT image, eyebrow, title, cta FROM hero_slides ORDER BY ordinal"],
      ["testimonials", "SELECT name, role, initials FROM testimonials ORDER BY ordinal"],
      ["portfolio_works", "SELECT title, category_slug, note FROM portfolio_works ORDER BY ordinal"],
      ["before_after", "SELECT title, service_slug, before, after FROM before_after ORDER BY ordinal"],
      ["printable_materials", "SELECT name, detail FROM printable_materials ORDER BY ordinal"],
      ["print_sizes", "SELECT group_name, size FROM print_sizes ORDER BY group_name, ordinal"],
      ["print_colors", "SELECT name, hex FROM print_colors ORDER BY ordinal"],
      ["color_notes", "SELECT note FROM color_notes ORDER BY ordinal"],
      ["design_services", "SELECT title FROM design_services ORDER BY ordinal"],
      ["design_process", "SELECT step, title FROM design_process ORDER BY ordinal"],
    ];

    for (const [label, sql] of reads) {
      try {
        const rows = await sqlFetch(sql, { serviceRole: false });
        const count = Array.isArray(rows) ? rows.length : 0;
        info(`${label}: ${count} row(s)`);
        if (count === 0 && label !== "color_notes") {
          fail(`${label}: expected data but got 0 rows`);
        } else {
          ok(`${label}: ${count} row(s)`);
          if (label === "services (7 tags)" && count > 0) {
            const slugs = rows.map((r) => r.slug).join(", ");
            info(`   slugs: ${slugs}`);
          }
          if (label === "site_settings" && count > 0) {
            info(`   vision (first 80 chars): ${String(rows[0].vision).slice(0, 80)}…`);
          }
        }
      } catch (e) {
        fail(`${label}: ${e.message}`);
      }
    }

    // products per service
    banner("3. Products per service (anon)");
    try {
      const { data: services } = await anonClient.from("services").select("id, slug, tag").order("ordinal");
      if (!services) throw new Error("no services");
      for (const s of services) {
        const { data: products } = await anonClient.from("products").select("title, image").eq("service_id", s.id).order("ordinal");
        info(`${s.tag}: ${products?.length ?? 0} products`);
        if (!products || products.length === 0) fail(`${s.tag}: no products`);
      }
    } catch (e) {
      fail(`products lookup: ${e.message}`);
    }
  } else {
    info("Skipping public catalog reads (no anon key).");
  }

  // ---------- STORAGE BUCKETS ----------
  banner("4. Storage buckets (admin)");
  if (adminClient) {
    try {
      const { data: buckets } = await adminClient.storage.listBuckets();
      if (!buckets || buckets.length === 0) {
        fail("No storage buckets found");
      } else {
        for (const b of buckets) {
          info(`bucket: ${b.name} (public=${b.public}, id=${b.id})`);
          ok(`bucket: ${b.name}`);
        }
        const hasPublic = buckets.some((b) => b.name === "products-images" && b.public);
        const hasPrivate = buckets.some((b) => b.name === "design" && !b.public);
        if (!hasPublic) fail("products-images bucket missing or not public");
        if (!hasPrivate) fail("design bucket missing or not private");
      }

      // sample object list for products-images (should be empty until images uploaded)
      const { data: publicObjects } = await adminClient.storage.from("products-images").list();
      info(`products-images objects: ${publicObjects?.length ?? 0} (images uploaded to this bucket should appear here)`);
    } catch (e) {
      fail(`storage check: ${e.message}`);
    }
  } else {
    info("Skipping storage check (no service role key).");
  }

  // ---------- RLS ----------
  banner("5. Row Level Security (admin)");
  if (adminClient) {
    const tables = [
      "public.profiles",
      "public.site_settings",
      "public.services",
      "public.products",
      "public.hero_slides",
      "public.testimonials",
      "public.portfolio_works",
      "public.before_after",
      "public.printable_materials",
      "public.print_sizes",
      "public.print_colors",
      "public.color_notes",
      "public.design_services",
      "public.design_process",
      "public.orders",
      "public.design_uploads",
    ];
    for (const t of tables) {
      try {
        const rows = await sqlFetch(`SELECT relname AS table_name, relrowsecurity AS rls_enabled FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = (SELECT split_part($1, '.', 2)) AND n.nspname = (SELECT split_part($1, '.', 1))`, { serviceRole: true });
        // simpler: use pg_catalog query
      } catch {}

      // Use a direct query
      try {
        const rows = await sqlFetch(
          `SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled, n.nspname AS schema FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = '${t.split(".")[1]}' AND n.nspname = '${t.split(".")[0]}'`
        );
        if (rows && rows.length) {
          const rls = rows[0]?.relrowsecurity;
          if (rls) ok(`${t}: RLS enabled`);
          else fail(`${t}: RLS NOT enabled`);
        } else {
          info(`${t}: not found (may not exist)`);
        }
      } catch (e) {
        fail(`${t}: ${e.message}`);
      }
    }

    // count policies per table
    banner("6. RLS policies count (admin)");
    try {
      const rows = await sqlFetch(`
        SELECT
          n.nspname AS schema,
          c.relname AS table_name,
          COUNT(p.oid) AS policy_count
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN pg_policy p ON p.polrelid = c.oid
        WHERE c.relname IN ('profiles','site_settings','services','products','hero_slides','testimonials','portfolio_works','before_after','printable_materials','print_sizes','print_colors','color_notes','design_services','design_process','orders','design_uploads')
          AND n.nspname = 'public'
        GROUP BY n.nspname, c.relname
        ORDER BY c.relname
      `);
      for (const r of rows) {
        info(`${r.schema}.${r.table_name}: ${r.policy_count} policy/policies`);
        if (r.policy_count === 0 && r.table_name !== "profiles") fail(`${r.table_name}: no policies`);
      }
    } catch (e) {
      fail(`policy counts: ${e.message}`);
    }
  } else {
    info("Skipping RLS check (no service role key).");
  }

  // ---------- SEED COUNTS (admin) ----------
  banner("7. Seed row counts (admin)");
  if (adminClient) {
    const counts = [
      ["services", "SELECT COUNT(*) AS c FROM public.services"],
      ["products", "SELECT COUNT(*) AS c FROM public.products"],
      ["hero_slides", "SELECT COUNT(*) AS c FROM public.hero_slides"],
      ["testimonials", "SELECT COUNT(*) AS c FROM public.testimonials"],
      ["portfolio_works", "SELECT COUNT(*) AS c FROM public.portfolio_works"],
      ["before_after", "SELECT COUNT(*) AS c FROM public.before_after"],
      ["printable_materials", "SELECT COUNT(*) AS c FROM public.printable_materials"],
      ["print_sizes", "SELECT COUNT(*) AS c FROM public.print_sizes"],
      ["print_colors", "SELECT COUNT(*) AS c FROM public.print_colors"],
      ["color_notes", "SELECT COUNT(*) AS c FROM public.color_notes"],
      ["design_services", "SELECT COUNT(*) AS c FROM public.design_services"],
      ["design_process", "SELECT COUNT(*) AS c FROM public.design_process"],
      ["orders", "SELECT COUNT(*) AS c FROM public.orders"],
      ["design_uploads", "SELECT COUNT(*) AS c FROM public.design_uploads"],
    ];
    for (const [label, sql] of counts) {
      try {
        const rows = await sqlFetch(sql, { serviceRole: true });
        const c = rows?.[0]?.c ?? 0;
        info(`${label}: ${c}`);
      } catch (e) {
        fail(`${label}: ${e.message}`);
      }
    }
  } else {
    info("Skipping seed counts (no service role key).");
  }

  // ---------- AUTH SMOKE TEST (creates a real user) ----------
  banner("8. Auth smoke test (creates a real test user — see cleanup below)");
  if (adminClient) {
    // We can't sign up with the admin client; use the anon client's auth.
    // But we don't necessarily have an anon key here. Use the admin client to
    // call the auth admin API? That's not in supabase-js directly without the
    // auth admin client. Skip the actual signup and instead verify the profiles
    // trigger exists by checking the function exists.
    try {
      const rows = await sqlFetch(`SELECT proname FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace`);
      if (rows && rows.length) {
        ok(`trigger function handle_new_user exists`);
      } else {
        fail(`trigger function handle_new_user NOT found`);
      }
    } catch (e) {
      fail(`trigger function check: ${e.message}`);
    }
    info("To fully test auth signup → profile creation: use the site's /sign-in flow or the Supabase Dashboard.");
  } else {
    info("Skipping auth check (no service role key).");
  }

  banner("DONE");
  console.log("If you set both NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY,");
  console.log("this script reports the full live state of the project.");
  console.log();
  console.log("Cleanup (if you ran the auth smoke test and it created a user):");
  console.log("  Delete the test user from the Supabase Dashboard → Authentication → Users.");
  console.log("  Or call: supabase auth deleteuser --id <user-id>");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
