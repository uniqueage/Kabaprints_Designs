/**
 * Shared content helpers — safe to import from both server and client code.
 *
 * The site's editable content lives in Supabase (see `lib/site-content.ts` for
 * the server-side loader). This module holds the pure parts so client
 * components can use them without pulling in the Supabase client:
 *
 *   - `resolveImage()` — turns a stored image value into a URL the browser can
 *     load (bundled asset path, or a full URL for uploads).
 *   - `whatsappHref()` — builds a wa.me deep link for a given number.
 *   - the `SiteInfo` / `SiteContent` types that describe what the site renders.
 *
 * `lib/data.ts` remains the static fallback: if Supabase is unreachable or a
 * table is still empty, the loader serves those values instead.
 */

import type {
  Service,
  HeroSlide,
  Testimonial,
  Work,
  BeforeAfter,
  DesignService,
  DesignProcessStep,
  SearchEntry,
} from "./data";

/** Opening hours shown across the site. Editable in Admin → Settings. */
export const DEFAULT_HOURS = "24/7";
/** Days the shop is open. Editable in Admin → Settings. */
export const DEFAULT_HOURS_DAYS = "Monday – Sunday";

/** Contact/brand details from the `site_settings` row (or the static defaults). */
export interface SiteInfo {
  name: string;
  tagline: string;
  vision: string;
  hours: string;
  hoursDays: string;
  phones: readonly { display: string; tel: string }[];
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
}

export interface PrintableMaterial {
  name: string;
  detail: string;
}

export interface PrintSizeGroup {
  group: string;
  sizes: string[];
}

export interface PrintColor {
  name: string;
  hex: string;
}

/** Everything the public site renders. */
export interface SiteContent {
  /** Where the content came from — useful for diagnostics, never shown in the UI. */
  source: "database" | "static" | "mixed";
  site: SiteInfo;
  services: Service[];
  heroSlides: HeroSlide[];
  testimonials: Testimonial[];
  portfolioWorks: Work[];
  beforeAfter: BeforeAfter[];
  printableMaterials: PrintableMaterial[];
  printSizes: PrintSizeGroup[];
  printColors: PrintColor[];
  colorNotes: string[];
  designServices: DesignService[];
  designProcess: DesignProcessStep[];
}

/**
 * Resolve a stored image value into a loadable URL.
 *
 * Accepted values (all three are valid in the admin editor):
 *   - `/images/tshirt.svg`            → bundled asset, used as-is
 *   - `/products-images/tshirt.svg`   → legacy seed path; the same files ship in
 *                                       `public/images`, so it is served from there
 *   - `https://…/storage/v1/…png`     → an image uploaded through the admin panel
 */
export function resolveImage(value: string | null | undefined): string {
  if (!value) return "";
  const path = String(value).trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith("/products-images/")) {
    const file = path.slice("/products-images/".length);
    if (file) return `/images/${file}`;
  }
  return path;
}

/** Image types accepted by the admin upload fields. */
export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

const DEFAULT_WHATSAPP_MESSAGE =
  "Hello Kabaprints! I would like to request a quote for my print job.";

/** Build a wa.me deep link for the given WhatsApp number. */
export function whatsappHref(
  number: string,
  message: string = DEFAULT_WHATSAPP_MESSAGE,
): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

const SEARCH_PAGES: { title: string; href: string; description: string }[] = [
  { title: "Home", href: "/", description: "Kabaprints homepage — carousel, services and vision" },
  { title: "All Services", href: "/services", description: "Every print and design service we offer" },
  { title: "Get a Quote", href: "/quote", description: "Materials, sizes, colours, sample projects and quote form" },
  { title: "Need a Design?", href: "/design", description: "Graphic design services, process and deliverables" },
  { title: "Upload Your Design", href: "/upload", description: "Upload PNG, JPG, JPEG, PDF or SVG files for printing" },
  { title: "Portfolio — Kabaprints Works", href: "/portfolio", description: "Before and after product showcase" },
  { title: "Sign In", href: "/sign-in", description: "Customer account sign in" },
];

/** Build the search index from live content (services, products, portfolio, pages). */
export function buildSearchIndex(content: SiteContent): SearchEntry[] {
  const entries: SearchEntry[] = SEARCH_PAGES.map((p) => ({ ...p, type: "Page" }));

  entries.push({
    title: "Contact & Open Hours",
    href: "/contact",
    description: `Call, WhatsApp and opening hours ${content.site.hours}, ${content.site.hoursDays}`,
    type: "Page",
  });

  for (const s of content.services) {
    entries.push({ title: s.tag, href: `/services/${s.slug}`, description: s.tagline, type: "Service" });
    for (const item of s.items) {
      entries.push({
        title: item.title,
        href: `/services/${s.slug}`,
        description: `${s.tag} — ${item.blurb}`,
        type: s.tag,
      });
    }
  }

  for (const w of content.portfolioWorks.slice(0, 12)) {
    entries.push({
      title: w.title,
      href: "/portfolio",
      description: `Kabaprints work — ${w.note}`,
      type: "Portfolio",
    });
  }

  return entries;
}
