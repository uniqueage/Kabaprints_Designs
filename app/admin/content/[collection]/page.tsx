import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/client";
import { listServices } from "@/lib/supabase/admin";
import { getCollection } from "../collections";
import CollectionManager, { type ServiceOption } from "../CollectionManager";

interface Params {
  params: Promise<{ collection: string }>;
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { collection } = await params;
  const def = getCollection(collection);
  return { title: def ? `${def.label} · Admin` : "Content · Admin" };
}

export default async function AdminCollectionPage({ params, searchParams }: Params) {
  const { collection } = await params;
  const query = await searchParams;
  const def = getCollection(collection);

  if (!def) notFound();

  let items: Record<string, unknown>[] = [];
  let loadError: string | undefined;

  try {
    const client = createSupabaseAdminClient();
    const { data, error } = await client.from(def.table).select("*").order("ordinal", { ascending: true });
    if (error) throw new Error(error.message);
    items = (data ?? []) as Record<string, unknown>[];
  } catch (err) {
    loadError =
      err instanceof Error
        ? `${err.message} — if the table is missing, run the schema push from /api/supabase/push.`
        : "Could not read this section from Supabase.";
  }

  // Options for `select` fields (portfolio categories, before/after services).
  let serviceOptions: ServiceOption[] = [];
  if (def.fields.some((f) => f.optionsFrom === "services")) {
    try {
      const services = await listServices();
      serviceOptions = services.map((s) => ({ value: s.slug, label: s.tag }));
    } catch {
      serviceOptions = [];
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          All content sections
        </Link>
      </div>

      <CollectionManager
        def={def}
        items={items}
        serviceOptions={serviceOptions}
        ok={query["ok"]}
        error={query["error"] ?? loadError}
      />
    </div>
  );
}
