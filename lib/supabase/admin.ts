/**
 * Admin (service-role) client + typed catalog mutation helpers for Kabaprints.
 *
 * These functions are SERVER ONLY and must never be shipped to the browser.
 * They are intended for:
 *  - An internal admin page on the site (protected with Supabase Auth + role check)
 *  - A headless CMS / admin dashboard you build separately
 *  - Direct API routes guarded by middleware that verifies the caller is an admin
 *
 * All mutations go through the service-role client, which bypasses RLS for reads
 * but still respects table CHECK constraints and foreign keys. The storage
 * admin also uses the service-role client to manage public bucket images.
 *
 * IMPORTANT: the service-role key is read from SUPABASE_SERVICE_ROLE_KEY at
 * runtime. It is NEVER exposed to the browser. If you build an admin route,
 * protect it with middleware that checks auth and the caller's profile.role.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, getSupabaseServiceRoleKey, isSupabaseConfigured } from "./env";
import type {
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
} from "@/supabase/lib/types";

// ---------- admin client ----------
function adminClient() {
  const env = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!env || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables (server only)."
    );
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);
}

/**
 * Upsert a single row by id and return the saved row.
 *
 * The id is resolved ONCE: a previous version called `crypto.randomUUID()`
 * separately for the insert and for the follow-up read, so the read never
 * matched the row that was just written and every upsert threw
 * "… upsert returned no row". Always go through this helper.
 */
async function upsertById<T>(
  table: string,
  input: Record<string, unknown> & { id?: string },
): Promise<T> {
  const c = adminClient();
  const id = input.id ?? crypto.randomUUID();
  const { data, error } = await c
    .from(table)
    .upsert({ ...input, id }, { onConflict: "id" })
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`${table} upsert returned no row`);
  return data as T;
}

// ---------- storage public URL helper ----------
function publicObjectUrl(path: string): string {
  const env = getSupabaseEnv();
  if (!env || !env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }
  const host = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  return `https://${host}/storage/v1/object/public/products-images${path}`;
}

// ---------- site settings ----------
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const c = adminClient();
  const { data, error } = await c
    .from("site_settings")
    .select("*")
    .eq("id", "a0000000-0000-0000-0000-000000000001")
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function upsertSiteSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
  const c = adminClient();
  const { data, error } = await c
    .from("site_settings")
    .upsert({ ...input, id: "a0000000-0000-0000-0000-000000000001" }, { onConflict: "id" })
    .select()
    .eq("id", "a0000000-0000-0000-0000-000000000001")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("site_settings row missing after upsert");
  return data;
}

// ---------- services ----------
export async function listServices(): Promise<Service[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("services")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const c = adminClient();
  const { data, error } = await c
    .from("services")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Service | null;
}

export async function upsertService(input: {
  id?: string;
  slug: string;
  tag: string;
  tagline: string;
  description: string;
  card_image: string; // storage path, e.g. /products-images/svc-transfer.svg
  hero_image: string;  // storage path
  ordinal?: number;
}): Promise<Service> {
  const c = adminClient();
  const { data, error } = await c
    .from("services")
    .upsert({ ...input, id: input.id ?? crypto.randomUUID() }, { onConflict: "slug" })
    .select()
    .eq("slug", input.slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("service upsert returned no row");
  return data as Service;
}

export async function deleteService(slug: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("services").delete().eq("slug", slug);
  if (error) throw error;
}

// ---------- products ----------
export async function listProductsForService(serviceId: string): Promise<Product[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("products")
    .select("*")
    .eq("service_id", serviceId)
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function upsertProduct(input: {
  id?: string;
  service_id: string;
  title: string;
  blurb: string;
  image: string;     // storage path
  ordinal?: number;
}): Promise<Product> {
  return upsertById<Product>("products", input);
}

export async function getProductById(id: string): Promise<Product | null> {
  const c = adminClient();
  const { data, error } = await c.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Product | null;
}

export async function deleteProduct(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ---------- hero slides ----------
export async function listHeroSlides(): Promise<HeroSlide[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("hero_slides")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as HeroSlide[];
}

export async function upsertHeroSlide(input: {
  id?: string;
  image: string;      // storage path
  eyebrow: string;
  title: string;
  blurb: string;
  meta: string[];     // stored as jsonb
  href: string;
  cta: string;
  ordinal?: number;
}): Promise<HeroSlide> {
  return upsertById<HeroSlide>("hero_slides", input);
}

export async function deleteHeroSlide(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("hero_slides").delete().eq("id", id);
  if (error) throw error;
}

// ---------- testimonials ----------
export async function listTestimonials(): Promise<Testimonial[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("testimonials")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

export async function upsertTestimonial(input: {
  id?: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating?: number;
  ordinal?: number;
}): Promise<Testimonial> {
  return upsertById<Testimonial>("testimonials", input);
}

export async function deleteTestimonial(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}

// ---------- portfolio works ----------
export async function listPortfolioWorks(): Promise<PortfolioWork[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("portfolio_works")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PortfolioWork[];
}

export async function upsertPortfolioWork(input: {
  id?: string;
  title: string;
  category_slug: string;
  image: string;   // storage path
  note: string;
  ordinal?: number;
}): Promise<PortfolioWork> {
  return upsertById<PortfolioWork>("portfolio_works", input);
}

export async function deletePortfolioWork(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("portfolio_works").delete().eq("id", id);
  if (error) throw error;
}

// ---------- before/after ----------
export async function listBeforeAfter(): Promise<BeforeAfter[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("before_after")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BeforeAfter[];
}

export async function upsertBeforeAfter(input: {
  id?: string;
  title: string;
  service_slug: string;
  href: string;
  before: string;  // storage path
  after: string;   // storage path
  note: string;
  ordinal?: number;
}): Promise<BeforeAfter> {
  return upsertById<BeforeAfter>("before_after", input);
}

export async function deleteBeforeAfter(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("before_after").delete().eq("id", id);
  if (error) throw error;
}

// ---------- printable materials ----------
export async function listPrintableMaterials(): Promise<PrintableMaterial[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("printable_materials")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PrintableMaterial[];
}

export async function upsertPrintableMaterial(input: {
  id?: string;
  name: string;
  detail: string;
  ordinal?: number;
}): Promise<PrintableMaterial> {
  return upsertById<PrintableMaterial>("printable_materials", input);
}

export async function deletePrintableMaterial(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("printable_materials").delete().eq("id", id);
  if (error) throw error;
}

// ---------- print sizes ----------
export async function listPrintSizes(): Promise<PrintSize[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("print_sizes")
    .select("*")
    .order("group_name", { ascending: true })
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PrintSize[];
}

export async function upsertPrintSize(input: {
  id?: string;
  group_name: string;
  size: string;
  ordinal?: number;
}): Promise<PrintSize> {
  return upsertById<PrintSize>("print_sizes", input);
}

export async function deletePrintSize(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("print_sizes").delete().eq("id", id);
  if (error) throw error;
}

// ---------- print colors ----------
export async function listPrintColors(): Promise<PrintColor[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("print_colors")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PrintColor[];
}

export async function upsertPrintColor(input: {
  id?: string;
  name: string;
  hex: string;
  ordinal?: number;
}): Promise<PrintColor> {
  return upsertById<PrintColor>("print_colors", input);
}

export async function deletePrintColor(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("print_colors").delete().eq("id", id);
  if (error) throw error;
}

// ---------- color notes ----------
export async function listColorNotes(): Promise<ColorNote[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("color_notes")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ColorNote[];
}

export async function upsertColorNote(input: {
  id?: string;
  note: string;
  ordinal?: number;
}): Promise<ColorNote> {
  return upsertById<ColorNote>("color_notes", input);
}

export async function deleteColorNote(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("color_notes").delete().eq("id", id);
  if (error) throw error;
}

// ---------- design services ----------
export async function listDesignServices(): Promise<DesignService[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("design_services")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DesignService[];
}

export async function upsertDesignService(input: {
  id?: string;
  title: string;
  detail: string;
  ordinal?: number;
}): Promise<DesignService> {
  return upsertById<DesignService>("design_services", input);
}

export async function deleteDesignService(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("design_services").delete().eq("id", id);
  if (error) throw error;
}

// ---------- design process ----------
export async function listDesignProcessSteps(): Promise<DesignProcessStep[]> {
  const c = adminClient();
  const { data, error } = await c
    .from("design_process")
    .select("*")
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DesignProcessStep[];
}

export async function upsertDesignProcessStep(input: {
  id?: string;
  step: string;
  title: string;
  detail: string;
  ordinal?: number;
}): Promise<DesignProcessStep> {
  return upsertById<DesignProcessStep>("design_process", input);
}

export async function deleteDesignProcessStep(id: string): Promise<void> {
  const c = adminClient();
  const { error } = await c.from("design_process").delete().eq("id", id);
  if (error) throw error;
}

// ---------- public URL for a storage path ----------
export { publicObjectUrl };
