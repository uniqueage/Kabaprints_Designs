import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/client";
import { COLLECTIONS, type IconKey } from "./collections";

export const metadata: Metadata = { title: "Content · Admin" };

/** Small icon set used for the section cards. */
const ICONS: Record<IconKey, string> = {
  package: "M12 3 3 7.5v9L12 21l9-4.5v-9L12 3Zm0 0v18",
  box: "M4 7h16v13H4zM4 7l2-4h12l2 4",
  file: "M6 3h9l4 4v14H6zM15 3v5h4",
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Zm10 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  users: "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-7 13v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1",
  bag: "M6 2 3 6v14h18V6l-3-4H6Zm-3 4h18M16 10a4 4 0 0 1-8 0",
  edit: "M17 3l4 4L7.5 20.5 2 22l1.5-5.5L17 3Zm-2 2 4 4",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a8 8 0 0 0-2-1.2L15 3H9l-.5 2.6a8 8 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A8 8 0 0 0 4 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 2 1.2L9 21h6l.5-2.6a8 8 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
};

async function countItems(table: string): Promise<number | null> {
  try {
    const client = createSupabaseAdminClient();
    const { count, error } = await client.from(table).select("id", { count: "exact", head: true });
    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const query = await searchParams;
  const ok = query["ok"];
  const error = query["error"];

  const counts = await Promise.all(COLLECTIONS.map((c) => countItems(c.table)));
  const env = getSupabaseConfigStatus();

  return (
    <div>
      {ok && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
          {ok}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-coral/30 bg-coral-light p-4 text-sm font-semibold text-coral-dark">
          {error}
        </div>
      )}

      <div className="mb-2 max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Content</h1>
        <p className="mt-1 text-ink-soft">
          Every section below is editable and feeds the public site directly — save a change and it appears on the
          website immediately, no redeploy needed.
        </p>
      </div>

      {!env.serviceRoleKey && (
        <div className="mt-5 rounded-xl border border-coral/30 bg-coral-light p-4 text-sm text-coral-dark">
          <p className="font-black">Server access key missing</p>
          <p className="mt-1">
            Set <code className="rounded bg-white/60 px-1 font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> in Vercel
            → Project Settings → Environment Variables so the dashboard can read and write content.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {COLLECTIONS.map((def, i) => {
          const count = counts[i];
          return (
            <Link
              key={def.slug}
              href={`/admin/content/${def.slug}`}
              className="group flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-silver-light/60 shadow-sm transition hover:border-brand/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand transition group-hover:bg-brand group-hover:text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                    <path d={ICONS[def.icon]} />
                  </svg>
                </span>
                <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-muted">
                  {count === null ? "—" : count}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-black text-ink transition group-hover:text-brand">{def.label}</h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{def.description}</p>
              <span className="mt-4 text-xs font-black uppercase tracking-widest text-coral">Manage →</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="flex items-center gap-4 rounded-2xl bg-ink p-5 text-white transition hover:bg-brand-dark"
        >
          <Image
            src="/images/tshirt.svg"
            alt=""
            width={56}
            height={56}
            className="hidden h-14 w-14 rounded-xl object-cover sm:block"
          />
          <span>
            <span className="block text-lg font-black">Products</span>
            <span className="mt-0.5 block text-sm text-white/70">
              The cards inside each service — with image upload and per-service ordering.
            </span>
          </span>
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-silver-light/60 shadow-sm transition hover:border-brand/40"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-light text-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
              <path d={ICONS.settings} />
            </svg>
          </span>
          <span>
            <span className="block text-lg font-black text-ink">Site settings</span>
            <span className="mt-0.5 block text-sm text-muted">
              Brand name, vision, opening hours, phone numbers, WhatsApp and email.
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
