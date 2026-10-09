/**
 * Typed catalog queries for the Kabaprints Supabase backend.
 *
 * These run against the PUBLIC schema and are designed to be called with an
 * anon-scoped client (or the admin client — both can read public tables).
 * They return data in the same shape as the static `lib/data.ts` exports so
 * the frontend can swap in live data by changing one import.
 *
 * IMPORTANT: image values stored here are storage paths like
 *   /products-images/tshirt.svg
 * and are served from the public `products-images` bucket. The frontend already
 * uses next.config.ts with `images: { unoptimized: true }`, so these paths
 * resolve directly.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Service,
  Product,
  HeroSlide,
  Testimonial,
  PortfolioWork,
  BeforeAfter,
  PrintableMaterial,
  PrintSize,
  PrintColor,
  ColorNote,
  DesignService,
  DesignProcessStep,
  SiteSettings,
  PhonesJson,
} from "./types";

// Reusable column transforms so stored storage-paths become absolute public URLs
// when rendered by the site. We keep the raw path in DB; the site can append the
// project URL only when needed, but public bucket objects are served directly
// from the Supabase project's public bucket URL. We therefore return the path
// as-is and let the frontend decide how to resolve it.
const PUBLIC_BUCKET_HOST = (url: string) => {
  // Derive the storage public host from the Supabase project URL.
  // e.g. https://ccabevypxuwzpbagkiji.supabase.co ->
  //      ccabevypxuwzpbagkiji.supabase.co/storage/v1/object/public/products-images/...
  // For public buckets the direct object URL is:
  //   https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const h = new URL(url).hostname;
  return (bucket: string, path: string) =>
    `https://${h}/storage/v1/object/public/${bucket}/${path}`;
};

export interface CatalogClient {
  url: string;
  storageUrl: (bucket: string, path: string) => string;
}

/**
 * Build a catalog query wrapper bound to a Supabase project URL.
 * The caller supplies the client (anon or admin) — this helper only provides
 * typed query functions.
 */
export function catalogQueries(url: string): CatalogClient & {
  getSiteSettings: () => Promise<SiteSettings | null>;
  getServices: () => Promise<Service[]>;
  getServiceBySlug: (slug: string) => Promise<Service | null>;
  getProductsByServiceId: (serviceId: string) => Promise<Product[]>;
  getHeroSlides: () => Promise<HeroSlide[]>;
  getTestimonials: () => Promise<Testimonial[]>;
  getPortfolioWorks: () => Promise<PortfolioWork[]>;
  getBeforeAfter: () => Promise<BeforeAfter[]>;
  getPrintableMaterials: () => Promise<PrintableMaterial[]>;
  getPrintSizes: () => Promise<PrintSize[]>;
  getPrintColors: () => Promise<PrintColor[]>;
  getColorNotes: () => Promise<ColorNote[]>;
  getDesignServices: () => Promise<DesignService[]>;
  getDesignProcessSteps: () => Promise<DesignProcessStep[]>;
} {
  const q = ((url: string) => {
    const c = createClient(url, "") as SupabaseClient;
    const storageUrl = PUBLIC_BUCKET_HOST(url);
    return c;
  })(url) as SupabaseClient;

  const storageUrl = PUBLIC_BUCKET_HOST(url);

  const one = async <T>(table: string, columns: string, filter: string): Promise<T | null> => {
    const { data, error } = await q.from(table).select(columns).eq(filter.split("=")[0], filter.split("=")[1]).maybeSingle();
    if (error || !data) return null;
    return data as T;
  };

  const many = async <T>(table: string, columns: string, opts?: { order?: string; eq?: string[] }): Promise<T[]> => {
    let query = q.from(table).select(columns);
    if (opts?.eq) {
      query = query.eq(opts.eq[0], opts.eq[1]);
    }
    if (opts?.order) {
      query = query.order(opts.order, { ascending: true });
    } else {
      query = query.order("ordinal", { ascending: true }).order("created_at", { ascending: true });
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data as T[];
  };

  return {
    url,
    storageUrl,
    getSiteSettings: async () => one<SiteSettings>("site_settings", "*", "id=a0000000-0000-0000-0000-000000000001"),
    getServices: () => many<Service>("services", "*", { order: "ordinal" }),
    getServiceBySlug: async (slug: string) => one<Service>("services", "*", `slug=${slug}`),
    getProductsByServiceId: (serviceId: string) => many<Product>("products", "*", { eq: ["service_id", serviceId] }),
    getHeroSlides: () => many<HeroSlide>("hero_slides", "*", { order: "ordinal" }),
    getTestimonials: () => many<Testimonial>("testimonials", "*", { order: "ordinal" }),
    getPortfolioWorks: () => many<PortfolioWork>("portfolio_works", "*", { order: "ordinal" }),
    getBeforeAfter: () => many<BeforeAfter>("before_after", "*", { order: "ordinal" }),
    getPrintableMaterials: () => many<PrintableMaterial>("printable_materials", "*", { order: "ordinal" }),
    getPrintSizes: () => many<PrintSize>("print_sizes", "*", { order: "ordinal" }),
    getPrintColors: () => many<PrintColor>("print_colors", "*", { order: "ordinal" }),
    getColorNotes: () => many<ColorNote>("color_notes", "*", { order: "ordinal" }),
    getDesignServices: () => many<DesignService>("design_services", "*", { order: "ordinal" }),
    getDesignProcessSteps: () => many<DesignProcessStep>("design_process", "*", { order: "ordinal" }),
  };
}
