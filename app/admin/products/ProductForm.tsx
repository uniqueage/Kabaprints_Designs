"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IMAGE_MIME_TYPES, resolveImage } from "@/lib/content-utils";
import { Plus, Save } from "@/lib/icons";
import type { Product, Service } from "@/supabase/lib/types";
import { saveProductAction } from "./actions";

interface Props {
  /** Existing product when editing; omitted when creating. */
  product?: Product;
  services: Service[];
  /** Service pre-selected for a new product. */
  defaultServiceId?: string;
}

const field =
  "w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none";
const label = "block text-xs font-black uppercase tracking-widest text-brand-dark";

/**
 * Create/edit form for a product. Images can be typed as a bundled path
 * (`/images/tshirt.svg`) or uploaded — an upload is stored in the public
 * `products-images` bucket and the absolute URL is saved on the product.
 */
export default function ProductForm({ product, services, defaultServiceId }: Props) {
  const [image, setImage] = useState(product?.image ?? "");
  const isEdit = Boolean(product);
  const preview = resolveImage(image);

  return (
    <form
      action={saveProductAction}
      className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm"
    >
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="border-b border-silver-light/60 px-5 py-4">
        <h2 className="text-lg font-black text-ink">Product details</h2>
        <p className="mt-0.5 text-sm text-muted">
          Everything here appears on the matching service page of the public site.
        </p>
      </div>

      <div className="divide-y divide-silver-light/40 px-5 py-4 sm:px-6">
        <div className="space-y-1.5">
          <label htmlFor="service_id" className={label}>
            Service (category) *
          </label>
          <select
            id="service_id"
            name="service_id"
            required
            defaultValue={product?.service_id ?? defaultServiceId ?? ""}
            className={field}
          >
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tag}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">Move the product to another service by changing this.</p>
        </div>

        <div className="space-y-1.5 pt-4">
          <label htmlFor="title" className={label}>
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={product?.title ?? ""}
            placeholder="Printed T-Shirts"
            className={field}
          />
        </div>

        <div className="space-y-1.5 pt-4">
          <label htmlFor="blurb" className={label}>
            Description *
          </label>
          <textarea
            id="blurb"
            name="blurb"
            required
            rows={3}
            defaultValue={product?.blurb ?? ""}
            placeholder="Photo-quality DTF and vinyl transfers on 100% cotton and poly-cotton blends."
            className={`${field} resize-y`}
          />
        </div>

        <div className="space-y-3 pt-4">
          <div className="grid gap-4 sm:grid-cols-[110px_1fr] sm:items-start">
            <div className="relative h-[74px] w-[92px] overflow-hidden rounded-lg bg-silver-light/50 ring-1 ring-silver-light">
              {preview ? (
                <Image src={preview} alt="" fill className="object-cover" sizes="92px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                  No image
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="image" className={label}>
                Image path or URL
              </label>
              <input
                id="image"
                name="image"
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/tshirt.svg"
                className={`${field} font-mono text-xs`}
              />
              <p className="text-xs text-muted">
                Use a bundled path such as <code className="rounded bg-silver-light px-1 py-0.5 font-mono">/images/tshirt.svg</code>,
                or upload a file below.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="image_file" className={label}>
              Upload a new image
            </label>
            <input
              id="image_file"
              name="image_file"
              type="file"
              accept={IMAGE_MIME_TYPES.join(",")}
              className="w-full rounded-xl border border-silver-light bg-cream px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-xs file:font-bold file:text-white focus:border-brand focus:bg-white focus:outline-none"
            />
            <p className="text-xs text-muted">
              Uploading replaces the value above with the new image URL (max ~4 MB).
            </p>
          </div>
        </div>

        <div className="space-y-1.5 pt-4">
          <label htmlFor="ordinal" className={label}>
            Display order
          </label>
          <input
            id="ordinal"
            name="ordinal"
            type="number"
            min={0}
            defaultValue={product?.ordinal ?? 0}
            className={`${field} max-w-[140px]`}
          />
          <p className="text-xs text-muted">Lower numbers appear first on the site.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-silver-light/60 bg-cream/50 px-5 py-4 sm:px-6">
        <Link href="/admin/products" className="text-sm font-semibold text-muted transition hover:text-ink">
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isEdit ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
