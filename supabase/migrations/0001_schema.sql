-- ============================================================
-- 0001 — schema (tables + enums + indexes)
-- Project: https://ccabevypxuwzpbagkiji.supabase.co
-- ============================================================

CREATE TYPE IF NOT EXISTS public.order_status AS ENUM (
  'draft','submitted','reviewing','quoted','approved','in_production','ready','shipped','delivered','cancelled'
);

-- profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone           text,
  display_name    text,
  avatar_url      text,
  role            text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- site_settings (singleton — editable hero / vision / hours / phones)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name       text NOT NULL DEFAULT 'Kabaprints',
  tagline         text NOT NULL DEFAULT 'Printshop + Design',
  vision          text NOT NULL DEFAULT 'Kabaprints is a Marketing and Printing Agency that specialises in Advert production. We are dynamic and highly creative professionals. As a matter of policy, our primary motive is to see that our clients'' communication campaigns lead to great profits',
  hours           text NOT NULL DEFAULT '9:00 am – 7:00 pm',
  hours_days      text NOT NULL DEFAULT 'Mondays – Saturdays',
  whatsapp_number text NOT NULL DEFAULT '2348032961171',
  email           text NOT NULL DEFAULT 'hello@kabaprints.com',
  phones_json     jsonb NOT NULL DEFAULT '[{"display":"0803 296 1171","tel":"+2348032961171"},{"display":"0915 281 2526","tel":"+2349152812526"}]',
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- services
CREATE TABLE IF NOT EXISTS public.services (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  tag             text NOT NULL,
  tagline         text NOT NULL,
  description     text NOT NULL,
  card_image      text NOT NULL,
  hero_image      text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- products (service items with images)
CREATE TABLE IF NOT EXISTS public.products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id      uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  title           text NOT NULL,
  blurb           text NOT NULL,
  image           text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- hero_slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image           text NOT NULL,
  eyebrow         text NOT NULL,
  title           text NOT NULL,
  blurb           text NOT NULL,
  meta            jsonb NOT NULL DEFAULT '[]',
  href            text NOT NULL,
  cta             text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote           text NOT NULL,
  name            text NOT NULL,
  role            text NOT NULL,
  initials        text NOT NULL,
  rating          integer NOT NULL DEFAULT 5,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- portfolio_works
CREATE TABLE IF NOT EXISTS public.portfolio_works (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  category_slug   text NOT NULL,
  image           text NOT NULL,
  note            text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- before_after
CREATE TABLE IF NOT EXISTS public.before_after (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  service_slug    text NOT NULL,
  href            text NOT NULL,
  before          text NOT NULL,
  after           text NOT NULL,
  note            text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- printable_materials
CREATE TABLE IF NOT EXISTS public.printable_materials (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  detail          text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- print_sizes
CREATE TABLE IF NOT EXISTS public.print_sizes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name      text NOT NULL,
  size            text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- print_colors
CREATE TABLE IF NOT EXISTS public.print_colors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  hex             text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- color_notes
CREATE TABLE IF NOT EXISTS public.color_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note            text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- design_services
CREATE TABLE IF NOT EXISTS public.design_services (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  detail          text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- design_process
CREATE TABLE IF NOT EXISTS public.design_process (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step            text NOT NULL,
  title           text NOT NULL,
  detail          text NOT NULL,
  ordinal         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name   text NOT NULL,
  customer_phone  text NOT NULL,
  customer_email  text,
  service_tag     text NOT NULL,
  quantity        text,
  deadline        date,
  details         text NOT NULL,
  status          public.order_status NOT NULL DEFAULT 'draft',
  message_json    jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- design_uploads
CREATE TABLE IF NOT EXISTS public.design_uploads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_path       text NOT NULL,
  file_name       text NOT NULL,
  file_mime       text NOT NULL,
  file_size       bigint NOT NULL,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','received','proofing','approved','rejected')),
  notes           text,
  order_id        uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- indexes
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS services_slug_idx ON public.services (slug);
CREATE INDEX IF NOT EXISTS services_ordinal_idx ON public.services (ordinal);
CREATE INDEX IF NOT EXISTS products_service_ordinal_idx ON public.products (service_id, ordinal);
CREATE INDEX IF NOT EXISTS hero_slides_ordinal_idx ON public.hero_slides (ordinal);
CREATE INDEX IF NOT EXISTS testimonials_ordinal_idx ON public.testimonials (ordinal);
CREATE INDEX IF NOT EXISTS portfolio_works_ordinal_idx ON public.portfolio_works (ordinal);
CREATE INDEX IF NOT EXISTS before_after_ordinal_idx ON public.before_after (ordinal);
CREATE INDEX IF NOT EXISTS printable_materials_ordinal_idx ON public.printable_materials (ordinal);
CREATE INDEX IF NOT EXISTS print_sizes_group_ordinal_idx ON public.print_sizes (group_name, ordinal);
CREATE INDEX IF NOT EXISTS print_colors_ordinal_idx ON public.print_colors (ordinal);
CREATE INDEX IF NOT EXISTS color_notes_ordinal_idx ON public.color_notes (ordinal);
CREATE INDEX IF NOT EXISTS design_services_ordinal_idx ON public.design_services (ordinal);
CREATE INDEX IF NOT EXISTS design_process_ordinal_idx ON public.design_process (ordinal);
CREATE INDEX IF NOT EXISTS orders_customer_idx ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_idx ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS design_uploads_customer_idx ON public.design_uploads (customer_id);
CREATE INDEX IF NOT EXISTS design_uploads_order_idx ON public.design_uploads (order_id);
