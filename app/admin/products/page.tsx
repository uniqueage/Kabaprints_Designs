import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, Plus, Trash2, Edit } from "@/lib/icons";
import { listServices, listProductsForService } from "@/lib/supabase/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/client";
import { deleteProductAction } from "./actions";
import type { Service, Product } from "@/supabase/lib/types";

export const metadata: Metadata = { title: "Products · Admin" };

interface ProductWithImage extends Product {
  imageUrl: string | null;
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const ok = params["ok"];
  const error = params["error"];

  const services = await listServices();
  const servicesWithProducts: Array<{ service: Service; products: ProductWithImage[] }> = await Promise.all(
    services.map(async (s) => {
      const products = await listProductsForService(s.id);
      const withImages = await Promise.all(
        products.map(async (p) => ({
          ...p,
          imageUrl: p.image.startsWith("/") ? (await imagePublicUrl(p.image)) ?? null : p.image,
        })),
      );
      return { service: s, products: withImages };
    }),
  );

  const totalProducts = servicesWithProducts.reduce((acc, { products }) => acc + products.length, 0);

  return (
    <div>
      {ok && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-semibold text-green-800">
          {ok}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-coral-light border border-coral/30 p-4 text-sm font-semibold text-coral-dark">
          {error}
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Products</h1>
          <p className="mt-1 text-ink-soft">
            {totalProducts} product{totalProducts === 1 ? "" : "s"} across {services.length} services.
            Images live in the <span className="font-semibold">products-images</span> storage bucket.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      {servicesWithProducts.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-sm font-semibold text-ink">No services yet</p>
          <p className="mt-1 text-sm text-muted">
            Add a service first from the{" "}
            <Link href="/admin/settings" className="font-bold text-brand hover:underline">
              settings
            </Link>{" "}
            page.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {servicesWithProducts.map(({ service, products }) => (
            <Section key={service.id} service={service} products={products} />
          ))}
        </div>
      )}
    </div>
  );
}

async function imagePublicUrl(path: string): Promise<string | null> {
  try {
    const admin = createSupabaseAdminClient();
    const { data } = admin.storage.from("products-images").getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch {
    return null;
  }
}

function Section({ service, products }: { service: Service; products: ProductWithImage[] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm">
      <div className="border-b border-silver-light/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-ink">{service.tag}</h2>
            <p className="mt-0.5 text-sm text-muted">{service.tagline}</p>
          </div>
          <div className="text-right text-xs text-muted">
            {products.length} product{products.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-muted">
          No products in this service yet.
        </div>
      ) : (
        <ul className="divide-y divide-silver-light/40">
          {products.map((product) => (
            <li key={product.id}>
              <ProductRow product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductRow({ product }: { product: ProductWithImage }) {
  return (
    <div className="group flex items-start gap-4 px-5 py-4 transition hover:bg-cream/50">
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-silver-light/60">
        {product.imageUrl && (
          <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="80px" />
        )}
        {!product.imageUrl && (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-ink">{product.title}</p>
          <DeleteButton productId={product.id} />
        </div>
        <p className="mt-0.5 text-sm text-muted line-clamp-2">{product.blurb}</p>
        <p className="mt-1 text-xs text-muted font-mono">{product.image}</p>
        <div className="mt-2">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center gap-1 rounded-lg border border-silver-light px-2.5 py-1 text-xs font-semibold text-ink-soft transition hover:border-brand hover:bg-brand-light hover:text-brand-dark"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

function DeleteButton({ productId }: { productId: string }) {
  return (
    <form action={async (formData: FormData) => {
      "use server";
      await deleteProductAction(productId);
    }}>
      <button
        type="submit"
        className="rounded-lg border border-silver-light px-3 py-1.5 text-xs font-semibold text-coral-dark transition hover:border-coral hover:bg-coral-light"
      >
        <Trash2 className="inline h-3.5 w-3.5 mr-1" />
        Delete
      </button>
    </form>
  );
}

import { redirect } from "next/navigation";
