import type { Metadata } from "next";
import Link from "next/link";
import { getProductById, listServices } from "@/lib/supabase/admin";
import ProductForm from "../../ProductForm";
import { deleteProductFormAction } from "../../actions";

export const metadata: Metadata = { title: "Edit product · Admin" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const ok = query["ok"];
  const error = query["error"];

  const [product, services] = await Promise.all([getProductById(id).catch(() => null), listServices()]);

  if (!product) {
    return (
      <div>
        <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-silver-light/60 shadow-sm">
          <h1 className="text-xl font-black text-ink">Product not found</h1>
          <p className="mt-2 text-sm text-muted">
            This product may have been deleted, or the link is out of date.
          </p>
          <Link
            href="/admin/products"
            className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const service = services.find((s) => s.id === product.service_id);

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
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Edit product</h1>
        <p className="mt-1 text-ink-soft">
          {product.title}
          {service ? <> · <span className="font-semibold">{service.tag}</span></> : null}
        </p>
      </div>

      <ProductForm product={product} services={services} />

      <form
        action={deleteProductFormAction}
        className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-silver-light/60 shadow-sm"
      >
        <div>
          <p className="text-sm font-bold text-ink">Delete this product</p>
          <p className="mt-0.5 text-xs text-muted">
            Removes the product from the site. Uploaded images are cleaned up automatically.
          </p>
        </div>
        <input type="hidden" name="id" value={product.id} />
        <button
          type="submit"
          className="rounded-full border border-coral/40 px-5 py-2.5 text-sm font-bold text-coral-dark transition hover:bg-coral hover:text-white"
        >
          Delete product
        </button>
      </form>
    </div>
  );
}
