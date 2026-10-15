import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "@/lib/icons";
import { listServices } from "@/lib/supabase/admin";
import ProductForm from "../ProductForm";

export const metadata: Metadata = { title: "New product · Admin" };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const query = await searchParams;
  const ok = query["ok"];
  const error = query["error"];
  const services = await listServices();

  if (services.length === 0) {
    return (
      <div>
        <div className="mb-2">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">New product</h1>
          <p className="mt-1 text-ink-soft">Add a new product to the catalogue.</p>
        </div>
        <div className="mt-6 rounded-2xl bg-white p-8 text-center ring-1 ring-silver-light/60 shadow-sm">
          <Package className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-sm font-semibold text-ink">No services yet</p>
          <p className="mt-1 text-sm text-muted">
            Create a service first from the{" "}
            <Link href="/admin/content/services" className="font-bold text-brand hover:underline">
              services
            </Link>{" "}
            section.
          </p>
        </div>
      </div>
    );
  }

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

      <div className="mb-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to products
        </Link>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">New product</h1>
        <p className="mt-1 text-ink-soft">
          Products appear as the “images &amp; details” cards on their service page.
        </p>
      </div>

      <ProductForm services={services} />
    </div>
  );
}
