import type { Metadata } from "next";
import { Plus, Package } from "@/lib/icons";
import { listServices } from "@/lib/supabase/admin";
import { upsertProduct } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { Service } from "@/supabase/lib/types";

export const metadata: Metadata = { title: "New product · Admin" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const ok = params["ok"];
  const error = params["error"];
  const services = await listServices();

  if (services.length === 0) {
    return (
      <div>
        <div className="mb-2">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">New product</h1>
          <p className="mt-1 text-ink-soft">
            Add a new product to the catalogue.
          </p>
        </div>
        <div className="mt-6 rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-sm font-semibold text-ink">No services yet</p>
          <p className="mt-1 text-sm text-muted">
            Create a service first from the{" "}
            <a href="/admin/settings" className="font-bold text-brand hover:underline">settings</a> page.
          </p>
        </div>
      </div>
    );
  }

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

      <div className="mb-2">
        <a href="/admin/products" className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-ink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6" /></svg>
          Back to products
        </a>
        <h1 className="ml-3 text-3xl font-black tracking-tight sm:text-4xl">New product</h1>
        <p className="mt-1 text-ink-soft">
          Add a product under one of your services. The image path should match an existing file in the{" "}
          <span className="font-semibold">products-images</span> storage bucket (e.g.{" "}
          <code className="rounded bg-silver-light px-1 py-0.5 text-xs font-mono">/products-images/tshirt.svg</code>).
        </p>
      </div>

      <form
        action={async (formData: FormData) => {
          "use server";
          const serviceId = String(formData.get("service_id") ?? "").trim();
          const title = String(formData.get("title") ?? "").trim();
          const blurb = String(formData.get("blurb") ?? "").trim();
          const image = String(formData.get("image") ?? "").trim();
          const ordinal = Number(formData.get("ordinal") ?? "0");


          try {
            await upsertProduct({
              service_id: serviceId,
              title,
              blurb,
              image,
              ordinal: Number.isNaN(ordinal) ? 0 : ordinal,
            });
            redirect("/admin/products?ok=Product+created.");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            redirect(`/admin/products/new?error=${encodeURIComponent(msg)}`);
          }
        }}
        className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm"
      >
        <div className="border-b border-silver-light/60 px-5 py-4">
          <h2 className="text-lg font-black text-ink">Product details</h2>
        </div>

        <div className="divide-y divide-silver-light/40 px-5 py-4 sm:px-6">
          <div className="space-y-1.5">
            <label htmlFor="service_id" className="block text-xs font-black uppercase tracking-widest text-brand-dark">
              Service
            </label>
            <select
              id="service_id"
              name="service_id"
              required
              className="w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none"
            >
              <option value="">Select a service…</option>
              {services.map((s: Service) => (
                <option key={s.id} value={s.id}>
                  {s.tag}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-xs font-black uppercase tracking-widest text-brand-dark">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Printed T-Shirts"
              className="w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="blurb" className="block text-xs font-black uppercase tracking-widest text-brand-dark">
              Description
            </label>
            <textarea
              id="blurb"
              name="blurb"
              required
              rows={3}
              placeholder="Photo-quality DTF and vinyl transfers on 100% cotton and poly-cotton blends."
              className="w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="image" className="block text-xs font-black uppercase tracking-widest text-brand-dark">
              Image path
            </label>
            <input
              id="image"
              name="image"
              type="text"
              required
              placeholder="/products-images/tshirt.svg"
              className="w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm font-mono focus:border-brand focus:bg-white focus:outline-none"
            />
            <p className="text-xs text-muted">
              Path inside the <span className="font-semibold">products-images</span> bucket.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ordinal" className="block text-xs font-black uppercase tracking-widest text-brand-dark">
              Display order
            </label>
            <input
              id="ordinal"
              name="ordinal"
              type="number"
              defaultValue={1}
              min={1}
              className="w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-silver-light/60 bg-cream/50 px-5 py-4 sm:px-6">
          <a href="/admin/products" className="text-sm font-semibold text-muted transition hover:text-ink">
            Cancel
          </a>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Create product
          </button>
        </div>
      </form>
    </div>
  );
}
