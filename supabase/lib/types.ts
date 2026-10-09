/**
 * Supabase generated-style types for the Kabaprints schema.
 * These mirror the tables defined in supabase/migrations/*.sql.
 * If you regenerate types with `supabase gen types typescript`, point it at
 * this project and merge; until then these are the contract the app code uses.
 */

// ---------- profiles ----------
export type ProfileRole = "customer" | "admin";

export interface Profile {
  id: string;
  phone: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
}

// ---------- site_settings ----------
export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  vision: string;
  hours: string;
  hours_days: string;
  whatsapp_number: string;
  email: string;
  phones_json: PhonesJson;
  updated_at: string;
}

export interface PhonesJson {
  display: string;
  tel: string;
}

// ---------- services ----------
export interface Service {
  id: string;
  slug: string;
  tag: string;
  tagline: string;
  description: string;
  card_image: string;
  hero_image: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- products ----------
export interface Product {
  id: string;
  service_id: string;
  title: string;
  blurb: string;
  image: string; // storage path, e.g. /products-images/tshirt.svg
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- hero_slides ----------
export type HeroSlideMeta = string;

export interface HeroSlide {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  blurb: string;
  meta: HeroSlideMeta[];
  href: string;
  cta: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- testimonials ----------
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- portfolio_works ----------
export interface PortfolioWork {
  id: string;
  title: string;
  category_slug: string;
  image: string;
  note: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- before_after ----------
export interface BeforeAfter {
  id: string;
  title: string;
  service_slug: string;
  href: string;
  before: string;
  after: string;
  note: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- printable_materials ----------
export interface PrintableMaterial {
  id: string;
  name: string;
  detail: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- print_sizes ----------
export interface PrintSize {
  id: string;
  group_name: string;
  size: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- print_colors ----------
export interface PrintColor {
  id: string;
  name: string;
  hex: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- color_notes ----------
export interface ColorNote {
  id: string;
  note: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- design_services ----------
export interface DesignService {
  id: string;
  title: string;
  detail: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- design_process ----------
export interface DesignProcessStep {
  id: string;
  step: string;
  title: string;
  detail: string;
  ordinal: number;
  created_at: string;
  updated_at: string;
}

// ---------- orders ----------
export type OrderStatus =
  | "draft"
  | "submitted"
  | "reviewing"
  | "quoted"
  | "approved"
  | "in_production"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_tag: string;
  quantity: string | null;
  deadline: string | null; // date
  details: string;
  status: OrderStatus;
  message_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ---------- design_uploads ----------
export type UploadStatus =
  | "pending"
  | "received"
  | "proofing"
  | "approved"
  | "rejected";

export interface DesignUpload {
  id: string;
  customer_id: string;
  file_path: string; // storage path, e.g. /design/{userId}/{filename}
  file_name: string;
  file_mime: string;
  file_size: number;
  status: UploadStatus;
  notes: string | null;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- util ----------
