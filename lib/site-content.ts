/**
 * Server-side content loader for the public site.
 *
 * Every public page renders from `getSiteContent()`, which reads the Supabase
 * catalog tables written by the admin dashboard (`/admin`). Behaviour:
 *
 *   1. If Supabase is not configured, or the request fails, the static values in
 *      `lib/data.ts` are served — the site never breaks because of the backend.
 *   2. Each collection falls back independently. Content that exists in the
 *      database wins; an empty table keeps the static defaults.
 *   3. Opening hours are normalised to 24/7 for rows that still hold the old
 *      "9:00 am – 7:00 pm / Mondays – Saturdays" values (a one-time change).
 *      Any other value saved in Admin → Settings is respected verbatim.
 *
 * The result is wrapped in React's `cache()` so a page render performs each
 * query at most once, however many components ask for the content.
 *
 * IMPORTANT: admin mutations must call `revalidatePath("/", "layout")` (the
 * shared content actions already do) so freshly saved content is picked up.
 */

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./supabase/env";
import {
  SITE,
  services as staticServices,
  heroSlides as staticHeroSlides,
  testimonials as staticTestimonials,
  portfolioWorks as staticPortfolioWorks,
  beforeAfter as staticBeforeAfter,
  printableMaterials as staticPrintableMaterials,
  printSizes as staticPrintSizes,
  printColors as staticPrintColors,
  colorNotes as staticColorNotes,
  designServices as staticDesignServices,
  designProcess as staticDesignProcess,
  type Service,
} from "./data";
import {
  DEFAULT_HOURS,
  DEFAULT_HOURS_DAYS,
  resolveImage,
  type PrintColor,
  type PrintableMaterial,
  type PrintSizeGroup,
  type SiteContent,
  type SiteInfo,
} from "./content-utils";

// ---------------------------------------------------------------------------
// static fallbacks
// ---------------------------------------------------------------------------

function staticSite(): SiteInfo {
  return {
    name: SITE.name,
    tagline: SITE.tagline,
    vision: SITE.vision,
    hours: DEFAULT_HOURS,
    hoursDays: DEFAULT_HOURS_DAYS,
    phones: SITE.phones.map((p) => ({ display: p.display, tel: p.tel })),
    whatsappNumber: SITE.whatsappNumber,
    whatsappDisplay: SITE.whatsappDisplay,
    email: SITE.email,
  };
}

function staticContent(): SiteContent {
  return {
    source: "static",
    site: staticSite(),
    services: staticServices,
    heroSlides: staticHeroSlides,
    testimonials: staticTestimonials,
    portfolioWorks: staticPortfolioWorks,
    beforeAfter: staticBeforeAfter,
    printableMaterials: staticPrintableMaterials,
    printSizes: staticPrintSizes,
    printColors: staticPrintColors,
    colorNotes: staticColorNotes,
    designServices: staticDesignServices,
    designProcess: staticDesignProcess,
  };
}

// ---------------------------------------------------------------------------
// database rows
// ---------------------------------------------------------------------------

interface DbSettings {
  site_name: string | null;
  tagline: string | null;
  vision: string | null;
  hours: string | null;
  hours_days: string | null;
  whatsapp_number: string | null;
  email: string | null;
  phones_json: unknown;
}

interface DbService {
  id: string;
  slug: string;
  tag: string;
  tagline: string;
  description: string;
  card_image: string;
  hero_image: string;
  ordinal: number;
}

interface DbProduct {
  id: string;
  service_id: string;
  title: string;
  blurb: string;
  image: string;
  ordinal: number;
}

interface DbHeroSlide {
  image: string;
  eyebrow: string;
  title: string;
  blurb: string;
  meta: unknown;
  href: string;
  cta: string;
}

interface DbTestimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

interface DbPortfolioWork {
  title: string;
  category_slug: string;
  image: string;
  note: string;
}

interface DbBeforeAfter {
  title: string;
  service_slug: string;
  href: string | null;
  before: string;
  after: string;
  note: string;
}

interface DbMaterial {
  name: string;
  detail: string;
}

interface DbPrintSize {
  group_name: string;
  size: string;
}

interface DbPrintColor {
  name: string;
  hex: string;
}

interface DbColorNote {
  note: string;
}

interface DbDesignService {
  title: string;
  detail: string;
}

interface DbDesignProcessStep {
  step: string;
  title: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// normalisation helpers
// ---------------------------------------------------------------------------

const LEGACY_HOURS = ["9:00 am – 7:00 pm", "9:00 am - 7:00 pm", "9am – 7pm", "9am - 7pm"];
const LEGACY_HOURS_DAYS = ["Mondays – Saturdays", "Monday – Saturday", "Mon - Sat", "Mon – Sat"];

/**
 * One-time normalisation: rows seeded before the switch to round-the-clock
 * opening still say "9:00 am – 7:00 pm / Mondays – Saturdays". Those exact
 * legacy values are replaced with the 24/7 defaults. Anything else the owner
 * types in Admin → Settings is kept exactly as saved.
 */
function normaliseHours(hours: string | null, days: string | null): { hours: string; hoursDays: string } {
  const rawHours = (hours ?? "").trim();
  const rawDays = (days ?? "").trim();
  const isLegacyHours = LEGACY_HOURS.some((v) => v.toLowerCase() === rawHours.toLowerCase());
  const isLegacyDays = LEGACY_HOURS_DAYS.some((v) => v.toLowerCase() === rawDays.toLowerCase());

  return {
    hours: !rawHours || isLegacyHours ? DEFAULT_HOURS : rawHours,
    hoursDays: !rawDays || isLegacyDays ? DEFAULT_HOURS_DAYS : rawDays,
  };
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function staticPhones(): { display: string; tel: string }[] {
  return staticSite().phones.map((p) => ({ display: p.display, tel: p.tel }));
}

function parsePhones(value: unknown): { display: string; tel: string }[] {
  if (!Array.isArray(value)) return staticPhones();
  const phones = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const display = typeof record.display === "string" ? record.display.trim() : "";
      const tel = typeof record.tel === "string" ? record.tel.trim() : "";
      if (!display && !tel) return null;
      return { display: display || tel, tel: tel || display };
    })
    .filter((p): p is { display: string; tel: string } => p !== null);
  return phones.length ? phones : staticPhones();
}

function whatsappDisplayFor(number: string, phones: { display: string; tel: string }[]): string {
  const target = digitsOnly(number).replace(/^0+/, "");
  const match = phones.find((p) => {
    const candidate = digitsOnly(p.tel).replace(/^0+/, "");
    return candidate.endsWith(target) || target.endsWith(candidate);
  });
  if (match) return match.display;
  return number;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : String(entry ?? "").trim()))
    .filter((entry) => entry.length > 0);
}

function groupSizes(rows: DbPrintSize[]): PrintSizeGroup[] {
  const groups = new Map<string, string[]>();
  for (const row of rows) {
    const group = (row.group_name ?? "").trim() || "Other";
    const size = (row.size ?? "").trim();
    if (!size) continue;
    const sizes = groups.get(group) ?? [];
    sizes.push(size);
    groups.set(group, sizes);
  }
  return [...groups.entries()].map(([group, sizes]) => ({ group, sizes }));
}

const staticServiceBySlug = (slug: string): Service | undefined =>
  staticServices.find((s) => s.slug === slug);

// ---------------------------------------------------------------------------
// loader
// ---------------------------------------------------------------------------

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const fallback = staticContent();
  const env = getSupabaseEnv();
  if (!env) return fallback;

  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  /** Read a table ordered by `ordinal`. Returns null when the read fails. */
  async function readTable<T>(table: string, orderBy = "ordinal"): Promise<T[] | null> {
    try {
      const { data, error } = await client.from(table).select("*").order(orderBy, { ascending: true });
      if (error || !data) return null;
      return data as T[];
    } catch {
      return null;
    }
  }

  async function readSettings(): Promise<DbSettings | null> {
    try {
      const { data, error } = await client
        .from("site_settings")
        .select("*")
        .eq("id", "a0000000-0000-0000-0000-000000000001")
        .maybeSingle();
      if (error || !data) return null;
      return data as DbSettings;
    } catch {
      return null;
    }
  }

  const [
    settings,
    dbServices,
    dbProducts,
    dbHeroSlides,
    dbTestimonials,
    dbPortfolio,
    dbBeforeAfter,
    dbMaterials,
    dbSizes,
    dbColors,
    dbColorNotes,
    dbDesignServices,
    dbDesignProcess,
  ] = await Promise.all([
    readSettings(),
    readTable<DbService>("services"),
    readTable<DbProduct>("products"),
    readTable<DbHeroSlide>("hero_slides"),
    readTable<DbTestimonial>("testimonials"),
    readTable<DbPortfolioWork>("portfolio_works"),
    readTable<DbBeforeAfter>("before_after"),
    readTable<DbMaterial>("printable_materials"),
    readTable<DbPrintSize>("print_sizes"),
    readTable<DbPrintColor>("print_colors"),
    readTable<DbColorNote>("color_notes"),
    readTable<DbDesignService>("design_services"),
    readTable<DbDesignProcessStep>("design_process"),
  ]);

  const usedDatabase: boolean[] = [false];

  // ----- site settings -----
  let site = fallback.site;
  if (settings) {
    const hours = normaliseHours(settings.hours, settings.hours_days);
    const phones = parsePhones(settings.phones_json);
    const whatsappNumber = (settings.whatsapp_number ?? "").trim() || fallback.site.whatsappNumber;
    site = {
      name: (settings.site_name ?? "").trim() || fallback.site.name,
      tagline: (settings.tagline ?? "").trim() || fallback.site.tagline,
      vision: (settings.vision ?? "").trim() || fallback.site.vision,
      hours: hours.hours,
      hoursDays: hours.hoursDays,
      phones,
      whatsappNumber,
      whatsappDisplay: whatsappDisplayFor(whatsappNumber, phones),
      email: (settings.email ?? "").trim() || fallback.site.email,
    };
    usedDatabase[0] = true;
  }

  // ----- services (with their products as items) -----
  let services = fallback.services;
  if (dbServices && dbServices.length > 0) {
    const products = dbProducts ?? [];
    services = dbServices.map((row) => {
      const fallbackService = staticServiceBySlug(row.slug);
      const items = products
        .filter((p) => p.service_id === row.id)
        .map((p) => ({
          title: p.title,
          blurb: p.blurb,
          image: resolveImage(p.image),
        }));
      return {
        slug: row.slug,
        tag: row.tag,
        tagline: row.tagline,
        description: row.description,
        cardImage: resolveImage(row.card_image),
        heroImage: resolveImage(row.hero_image),
        items,
        // The detail-page reference lists are not part of the catalog tables;
        // keep the seeded values that match this service slug.
        substrates: fallbackService?.substrates ?? [],
        techniques: fallbackService?.techniques ?? [],
        bestFor: fallbackService?.bestFor ?? [],
      } satisfies Service;
    });
    usedDatabase[0] = true;
  }

  // ----- hero slides -----
  let heroSlides = fallback.heroSlides;
  if (dbHeroSlides && dbHeroSlides.length > 0) {
    heroSlides = dbHeroSlides.map((row) => ({
      image: resolveImage(row.image),
      eyebrow: row.eyebrow,
      title: row.title,
      blurb: row.blurb,
      meta: toStringArray(row.meta),
      href: row.href,
      cta: row.cta,
    }));
    usedDatabase[0] = true;
  }

  // ----- testimonials -----
  let testimonials = fallback.testimonials;
  if (dbTestimonials && dbTestimonials.length > 0) {
    testimonials = dbTestimonials.map((row) => ({
      quote: row.quote,
      name: row.name,
      role: row.role,
      initials: row.initials,
    }));
    usedDatabase[0] = true;
  }

  // ----- portfolio works -----
  let portfolioWorks = fallback.portfolioWorks;
  if (dbPortfolio && dbPortfolio.length > 0) {
    portfolioWorks = dbPortfolio.map((row) => ({
      title: row.title,
      category: row.category_slug,
      image: resolveImage(row.image),
      note: row.note,
    }));
    usedDatabase[0] = true;
  }

  // ----- before / after -----
  let beforeAfter = fallback.beforeAfter;
  if (dbBeforeAfter && dbBeforeAfter.length > 0) {
    const tagFor = (slug: string) =>
      services.find((s) => s.slug === slug)?.tag ?? staticServiceBySlug(slug)?.tag ?? slug;
    beforeAfter = dbBeforeAfter.map((row) => ({
      title: row.title,
      service: tagFor(row.service_slug),
      href: (row.href ?? "").trim() || `/services/${row.service_slug}`,
      before: resolveImage(row.before),
      after: resolveImage(row.after),
      note: row.note,
    }));
    usedDatabase[0] = true;
  }

  // ----- quote page reference lists -----
  let printableMaterials: PrintableMaterial[] = fallback.printableMaterials;
  if (dbMaterials && dbMaterials.length > 0) {
    printableMaterials = dbMaterials.map((row) => ({ name: row.name, detail: row.detail }));
    usedDatabase[0] = true;
  }

  let printSizes: PrintSizeGroup[] = fallback.printSizes;
  if (dbSizes && dbSizes.length > 0) {
    printSizes = groupSizes(dbSizes);
    usedDatabase[0] = true;
  }

  let printColors: PrintColor[] = fallback.printColors;
  if (dbColors && dbColors.length > 0) {
    printColors = dbColors.map((row) => ({ name: row.name, hex: row.hex }));
    usedDatabase[0] = true;
  }

  let colorNotes: string[] = fallback.colorNotes;
  if (dbColorNotes && dbColorNotes.length > 0) {
    colorNotes = dbColorNotes.map((row) => row.note);
    usedDatabase[0] = true;
  }

  // ----- design page -----
  let designServices = fallback.designServices;
  if (dbDesignServices && dbDesignServices.length > 0) {
    designServices = dbDesignServices.map((row) => ({ title: row.title, detail: row.detail }));
    usedDatabase[0] = true;
  }

  let designProcess = fallback.designProcess;
  if (dbDesignProcess && dbDesignProcess.length > 0) {
    designProcess = dbDesignProcess.map((row) => ({ step: row.step, title: row.title, detail: row.detail }));
    usedDatabase[0] = true;
  }

  return {
    source: usedDatabase[0] ? "database" : "static",
    site,
    services,
    heroSlides,
    testimonials,
    portfolioWorks,
    beforeAfter,
    printableMaterials,
    printSizes,
    printColors,
    colorNotes,
    designServices,
    designProcess,
  };
});

/** Convenience: just the brand/contact settings. */
export async function getSiteInfo(): Promise<SiteInfo> {
  return (await getSiteContent()).site;
}
