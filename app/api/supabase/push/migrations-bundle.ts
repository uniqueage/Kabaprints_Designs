// Auto-generated migration SQL (inlined at build time so the Vercel
// function does not depend on the filesystem at runtime.)
// Regenerate by running: node scripts/bundle-migrations.mjs
// Source of truth: supabase/migrations/*.sql
//
// NOTE: some migrations contain VACUUM ANALYZE statements which cannot run
// inside a transaction. Runners that wrap each migration in BEGIN..COMMIT must
// execute the VACUUM statements outside the transaction (see push-schema.mjs
// and the Vercel push route).

export const MIGRATION_0001_schema_sql = `-- ============================================================
-- 0001 — schema (tables + enums + indexes)
-- Project: https://ccabevypxuwzpbagkiji.supabase.co
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'order_status' AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.order_status AS ENUM (
      'draft','submitted','reviewing','quoted','approved','in_production','ready','shipped','delivered','cancelled'
    );
  END IF;
END
$$;

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
  hours           text NOT NULL DEFAULT '24/7',
  hours_days      text NOT NULL DEFAULT 'Monday – Sunday',
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
`;

export const MIGRATION_0002_rls_policies_sql = `-- ============================================================
-- 0002 — RLS + policies + auth trigger + storage buckets
-- Project: https://ccabevypxuwzpbagkiji.supabase.co
-- ============================================================

-- ---------- ownership preamble ----------
-- The Management API creates tables as a role that may not be the caller.
-- Reassign ownership to the current role so the RLS/policy DDL below
-- (which requires table ownership) succeeds. Safe to re-run.
ALTER TABLE public.profiles            OWNER TO current_user;
ALTER TABLE public.site_settings       OWNER TO current_user;
ALTER TABLE public.services            OWNER TO current_user;
ALTER TABLE public.products            OWNER TO current_user;
ALTER TABLE public.hero_slides         OWNER TO current_user;
ALTER TABLE public.testimonials        OWNER TO current_user;
ALTER TABLE public.portfolio_works     OWNER TO current_user;
ALTER TABLE public.before_after        OWNER TO current_user;
ALTER TABLE public.printable_materials OWNER TO current_user;
ALTER TABLE public.print_sizes         OWNER TO current_user;
ALTER TABLE public.print_colors        OWNER TO current_user;
ALTER TABLE public.color_notes         OWNER TO current_user;
ALTER TABLE public.design_services     OWNER TO current_user;
ALTER TABLE public.design_process      OWNER TO current_user;
ALTER TABLE public.orders              OWNER TO current_user;
ALTER TABLE public.design_uploads      OWNER TO current_user;
DO $$
BEGIN
  ALTER TABLE storage.objects OWNER TO current_user;
EXCEPTION WHEN OTHERS THEN NULL;
END
$$;

-- ---------- enable RLS everywhere ----------
ALTER TABLE public.profiles           FORCE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.services           FORCE ROW LEVEL SECURITY;
ALTER TABLE public.products           FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides        FORCE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_works    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.before_after       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.printable_materials FORCE ROW LEVEL SECURITY;
ALTER TABLE public.print_sizes        FORCE ROW LEVEL SECURITY;
ALTER TABLE public.print_colors       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.color_notes        FORCE ROW LEVEL SECURITY;
ALTER TABLE public.design_services    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.design_process     FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.design_uploads     FORCE ROW LEVEL SECURITY;
DO $$
BEGIN
  ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END
$$;

-- ---------- reusable admin check ----------
-- A user is an admin when their profile.role = 'admin'.
-- PUBLIC access (no auth) falls through to the ELSE branch.

-- ---------- profiles ----------
CREATE POLICY "profiles: users can insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: users can update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: admins manage all"
  ON public.profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- auto-create profile on signup (SECURITY DEFINER so it runs as table owner)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_ ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_ ->> 'phone',
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- site_settings ----------
CREATE POLICY "site_settings: public read"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "site_settings: admins manage"
  ON public.site_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ---------- services ----------
CREATE POLICY "services: public read" ON public.services FOR SELECT USING (true);
CREATE POLICY "services: admins manage"
  ON public.services FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- products ----------
CREATE POLICY "products: public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products: admins manage"
  ON public.products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- hero_slides ----------
CREATE POLICY "hero_slides: public read" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "hero_slides: admins manage"
  ON public.hero_slides FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- testimonials ----------
CREATE POLICY "testimonials: public read" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "testimonials: admins manage"
  ON public.testimonials FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- portfolio_works ----------
CREATE POLICY "portfolio_works: public read" ON public.portfolio_works FOR SELECT USING (true);
CREATE POLICY "portfolio_works: admins manage"
  ON public.portfolio_works FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- before_after ----------
CREATE POLICY "before_after: public read" ON public.before_after FOR SELECT USING (true);
CREATE POLICY "before_after: admins manage"
  ON public.before_after FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- printable_materials ----------
CREATE POLICY "printable_materials: public read" ON public.printable_materials FOR SELECT USING (true);
CREATE POLICY "printable_materials: admins manage"
  ON public.printable_materials FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- print_sizes ----------
CREATE POLICY "print_sizes: public read" ON public.print_sizes FOR SELECT USING (true);
CREATE POLICY "print_sizes: admins manage"
  ON public.print_sizes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- print_colors ----------
CREATE POLICY "print_colors: public read" ON public.print_colors FOR SELECT USING (true);
CREATE POLICY "print_colors: admins manage"
  ON public.print_colors FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- color_notes ----------
CREATE POLICY "color_notes: public read" ON public.color_notes FOR SELECT USING (true);
CREATE POLICY "color_notes: admins manage"
  ON public.color_notes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- design_services ----------
CREATE POLICY "design_services: public read" ON public.design_services FOR SELECT USING (true);
CREATE POLICY "design_services: admins manage"
  ON public.design_services FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- design_process ----------
CREATE POLICY "design_process: public read" ON public.design_process FOR SELECT USING (true);
CREATE POLICY "design_process: admins manage"
  ON public.design_process FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- orders ----------
CREATE POLICY "orders: customers read own"
  ON public.orders FOR SELECT
  USING (customer_id IS NULL OR customer_id = auth.uid());

CREATE POLICY "orders: customers insert own"
  ON public.orders FOR INSERT
  WITH CHECK (customer_id IS NULL OR customer_id = auth.uid());

CREATE POLICY "orders: customers update own"
  ON public.orders FOR UPDATE
  USING (customer_id IS NULL OR customer_id = auth.uid())
  WITH CHECK (customer_id IS NULL OR customer_id = auth.uid());

CREATE POLICY "orders: admins manage all"
  ON public.orders FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- design_uploads ----------
CREATE POLICY "design_uploads: customers read own" ON public.design_uploads FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "design_uploads: customers insert own" ON public.design_uploads FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "design_uploads: customers update own"
  ON public.design_uploads FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());
CREATE POLICY "design_uploads: admins manage all"
  ON public.design_uploads FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- storage buckets ----------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('products-images','products-images',true,10485760,NULL),
  ('design','design',false,26214400,ARRAY['image/png','image/jpeg','application/pdf','image/svg+xml'])
ON CONFLICT DO NOTHING;

CREATE POLICY "storage.products-images: public read"
  ON storage.objects FOR SELECT USING (bucket_id = 'products-images');

CREATE POLICY "storage.products-images: admins manage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'products-images' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "storage.design: owners view own"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'design' AND owner = auth.uid());

CREATE POLICY "storage.design: owners upload own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'design' AND owner = auth.uid());

CREATE POLICY "storage.design: owners delete own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'design' AND owner = auth.uid());
`;

export const MIGRATION_0003_seed_sql = `-- ============================================================
-- 0003 — seed (idempotent; safe to re-run)
-- Image paths use /products-images/{filename}.svg — those files are generated by scripts/gen-images.mjs.
-- ============================================================

-- site_settings: singleton row
INSERT INTO public.site_settings (id, site_name, tagline, vision, hours, hours_days, whatsapp_number, email, phones_json)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Kabaprints',
  'Printshop + Design',
  'Kabaprints is a Marketing and Printing Agency that specialises in Advert production. We are dynamic and highly creative professionals. As a matter of policy, our primary motive is to see that our clients'' communication campaigns lead to great profits',
  '24/7',
  'Monday – Sunday',
  '2348032961171',
  'hello@kabaprints.com',
  '[{"display":"0803 296 1171","tel":"+2348032961171"},{"display":"0915 281 2526","tel":"+2349152812526"}]'
) ON CONFLICT DO NOTHING;

-- services (7 tags)
INSERT INTO public.services (id, slug, tag, tagline, description, card_image, hero_image, ordinal)
VALUES
  ('b0000000-0000-0000-0000-000000000001','transfer-print','Transfer Print','Vivid, durable heat-transfer prints for apparel and fabric accessories.','Our transfer print service presses full-colour artwork onto fabric with DTF, HTV and sublimation technology. The result is a soft, stretchable print that survives hundreds of washes — ideal for small runs, custom pieces and photo-quality designs.','/products-images/svc-transfer.svg','/products-images/hero-transfer.svg',1),
  ('b0000000-0000-0000-0000-000000000002','screen-print','Screen Print','Bold, cost-effective ink printing made for bulk orders.','Screen printing pushes premium plastisol or water-based ink through a fine mesh screen to produce rich, opaque colours that last. It is the most economical method for larger quantities and the industry standard for uniform and promo runs.','/products-images/svc-screen.svg','/products-images/hero-screen.svg',2),
  ('b0000000-0000-0000-0000-000000000003','clean-banners','Clean Banners','Crisp large-format and stationery printing that makes events shine.','From handbills to stadium-size backdrops, we print sharp, colour-accurate graphics on presses calibrated for CMYK and Pantone. Every piece is checked for alignment, bleed and finish before it leaves the shop.','/products-images/svc-banners.svg','/products-images/hero-banners.svg',3),
  ('b0000000-0000-0000-0000-000000000004','van-display','Van Display','Turn every kilometre into an impression with professional vehicle branding.','We design, print and install vehicle graphics using premium cast vinyl rated for Nigeria''s sun and roads. Your bus, keke, van or car becomes a 24/7 billboard that reaches thousands of people every day.','/products-images/svc-van.svg','/products-images/hero-van.svg',4),
  ('b0000000-0000-0000-0000-000000000005','engraving','Engraving','Precision engraving for moments worth remembering.','Our laser and rotary engravers etch names, logos and messages into wood, metal, acrylic and glass with micron-level accuracy. Personalised, permanent and premium — the gift that never fades.','/products-images/svc-engraving.svg','/products-images/svc-engraving.svg',5),
  ('b0000000-0000-0000-0000-000000000006','signage','Signage','Everything your brand needs to be seen — on desks, doors and streets.','We print the everyday brand essentials and fabricate the big, visible stuff: shop signs, illuminated light boxes and 3D letters that draw customers in from the road. Designed, produced and installed by one team.','/products-images/svc-signage.svg','/products-images/svc-signage.svg',6),
  ('b0000000-0000-0000-0000-000000000007','others','Others','Custom branded merchandise and special requests, done right.','If it can carry a logo, we can probably print it. This is where odd jobs, promotional products and one-off creative requests live — sourced, branded and delivered by the same team you already trust.','/products-images/svc-others.svg','/products-images/svc-others.svg',7)
ON CONFLICT (slug) DO NOTHING;

-- products: one row per service item. Map title -> slug explicitly.
INSERT INTO public.products (id, service_id, title, blurb, image, ordinal)
SELECT gen_random_uuid(), s.id, p.title, p.blurb, '/products-images/' || p.img, p.ord
FROM public.services s,
  (VALUES
    ('Printed T-Shirts','Photo-quality DTF and vinyl transfers on 100% cotton and poly-cotton blends — perfect for events, merch and team tees.','tshirt.svg',1,'transfer-print'),
    ('Hoodies','Puff, flock and silicone transfers that stay crisp and flexible wash after wash on fleece and French terry.','hoodie.svg',2,'transfer-print'),
    ('Face Caps','Crisp front, side and back transfers applied with curved platens so the print follows the cap perfectly.','cap.svg',3,'transfer-print'),
    ('Throw Pillows','Quotes, photos and patterns pressed onto cushion covers for homes, hotels, lounges and event décor.','pillow.svg',4,'transfer-print'),
    ('Printed Nylons','Durable logo prints on nylon bags — crisp, opaque ink that does not crack on flexible material.','nylon.svg',1,'screen-print'),
    ('Shopping Bags','Branded canvas and tote bags that customers reuse again and again — walking adverts for your business.','shopping-bag.svg',2,'screen-print'),
    ('Uniforms','Company, school and security uniforms with left-chest logos, back prints and reflective accents.','uniform.svg',3,'screen-print'),
    ('Bulk T-Shirts','One to six colour prints at unbeatable per-piece pricing for rallies, launches and annual events.','bulk-shirts.svg',4,'screen-print'),
    ('Flyers','Handbills and leaflets on glossy, matt or uncoated stock — 130gsm to 170gsm, folded or flat.','flyers.svg',1,'clean-banners'),
    ('Sticker Printing','Die-cut, circle and square stickers on paper, vinyl and transparent stock with strong permanent adhesive.','stickers.svg',2,'clean-banners'),
    ('Wedding Cards','Invitation suites on ivory, pearl and art card with foil, emboss and ribbon finishes.','wedding-cards.svg',3,'clean-banners'),
    ('Roll-up Banners','Portable 850mm and 1000mm pull-up banners with aluminium cassettes — set up in seconds.','rollup-banners.svg',4,'clean-banners'),
    ('Posters','A3 to A1 posters on glossy, silk and matt art paper for promotions, announcements and art prints.','posters.svg',5,'clean-banners'),
    ('Backdrops','Step-and-repeat and event backdrops printed on scrim or vinyl for photo zones, stages and expos.','backdrops.svg',6,'clean-banners'),
    ('Vehicle Branding','Full and partial wraps for vans, SUVs and trucks — contour-cut panels, squeegeed bubble-free.','vehicle-branding.svg',1,'van-display'),
    ('Car Stickers','Door decals, logo stickers, number-board lettering and rear-screen graphics in cut vinyl.','car-stickers.svg',2,'van-display'),
    ('Bus Branding','Side panels, window one-way-vision films and fleet numbers that keep your buses on-brand.','bus-branding.svg',3,'van-display'),
    ('Keke Branding','Affordable, high-impact branding for commercial tricycles — logo, colours and contact details.','keke-branding.svg',4,'van-display'),
    ('Picture Framing','Framed photographs and art with an engraved name plate beneath — a personal gift for milestones.','picture-framing.svg',1,'engraving'),
    ('Awards','Crystal, glass and wooden trophies engraved with recipient names, categories and dates.','awards.svg',2,'engraving'),
    ('Plaques','Executive wood plaques with brushed-metal plates for retirements, donations and appreciation.','plaques.svg',3,'engraving'),
    ('Name Tags','Enamel-style name badges and lapel tags with magnetic or pin backs for staff and events.','name-tags.svg',4,'engraving'),
    ('Business Cards','Premium 350gsm cards with matt lamination, spot UV and rounded corners that get noticed.','business-cards.svg',1,'signage'),
    ('Jotters','Branded spiral jotters and notebooks for conferences, schools and corporate giveaways.','jotters.svg',2,'signage'),
    ('Exercise Books','Custom-covered exercise books for schools, churches and training programmes in any quantity.','exercise-books.svg',3,'signage'),
    ('Shop Signs','Fronts, fascia and direction signs on ACP, acrylic and PVC with vivid long-life colour.','shop-signs.svg',4,'signage'),
    ('3D Letters','Built-up acrylic and metal letters — halo-lit or front-lit — for lobby walls and shopfronts.','letters-3d.svg',5,'signage'),
    ('Light Boxes','Illuminated LED light boxes that keep your brand glowing day and night.','light-boxes.svg',6,'signage'),
    ('Branded Mugs','Ceramic and travel mugs sublimated with full-colour wraps for desks and gift packs.','branded-mugs.svg',1,'others'),
    ('Branded Pens','Metal and plastic pens laser-marked or pad-printed — the classic conference giveaway.','branded-pens.svg',2,'others'),
    ('Branded Packaging','Kraft bags, rigid boxes, hang tags and product labels that make unboxing feel premium.','packaging.svg',3,'others')
  ) AS p(title, blurb, img, ord, slug)
WHERE s.slug = p.slug
ON CONFLICT DO NOTHING;

-- hero_slides
INSERT INTO public.hero_slides (id, image, eyebrow, title, blurb, meta, href, cta, ordinal)
VALUES
  ('c0000000-0000-0000-0000-000000000001','/products-images/hero-transfer.svg','Transfer Print','Apparel prints that stay vivid, wash after wash','Photo-quality DTF and vinyl transfers on t-shirts, hoodies, face caps and throw pillows — soft to the touch, bold to the eye.','["DTF & HTV","Small runs welcome","48-hour turnaround"]','/services/transfer-print','See transfer prints',1),
  ('c0000000-0000-0000-0000-000000000002','/products-images/hero-screen.svg','Screen Print','Bulk printing with unbeatable per-piece pricing','Opaque plastisol ink on nylons, shopping bags, uniforms and bulk t-shirts — one to six colours, fifty pieces and above.','["1–6 colours","Bulk discounts","Durable ink"]','/services/screen-print','See screen printing',2),
  ('c0000000-0000-0000-0000-000000000003','/products-images/hero-banners.svg','Clean Banners','Flyers, cards, banners and backdrops that stop crowds','Colour-accurate large-format printing for weddings, expos and promotions — checked for bleed, alignment and finish.','["A6 to A1","Foil & emboss","Custom sizes"]','/services/clean-banners','See banners & print',3),
  ('c0000000-0000-0000-0000-000000000004','/products-images/hero-van.svg','Van Display','Fleet branding that advertises while you drive','Full wraps, decals and cut-letter branding for vans, buses, cars and keke — premium cast vinyl installed bubble-free.','["Full & partial wraps","UV laminated","Fleet packages"]','/services/van-display','See vehicle branding',4),
  ('c0000000-0000-0000-0000-000000000005','/products-images/hero-signage.svg','Signage','Shop signs, 3D letters and light boxes that get you found','Designed, fabricated and installed by one team — plus the stationery your brand runs on every day.','["LED lit","3D letters","Installed for you"]','/services/signage','See signage',5)
ON CONFLICT DO NOTHING;

-- testimonials
INSERT INTO public.testimonials (id, quote, name, role, initials, rating, ordinal)
VALUES
  ('d0000000-0000-0000-0000-000000000001','The event shirts came out exactly as designed — soft, colourful and still fresh after many washes. Kabaprints handled 400 pieces for us in three days.','Chinedu Okafor','Event Planner, Lagos','CO',5,1),
  ('d0000000-0000-0000-0000-000000000002','They branded our entire bus and keke fleet. Passengers ask us for our address every week — that is how good the work looks.','Musa Ibrahim','Logistics CEO, Abuja','MI',5,2),
  ('d0000000-0000-0000-0000-000000000003','Our wedding cards and backdrop were the talk of the event. The foil finishing looked far more expensive than what we paid.','Tolu & Kemi Adeyemi','Wedding Clients','TK',5,3),
  ('d0000000-0000-0000-0000-000000000004','From proofing to installation, the light box sign was completely hassle-free. The shop is now impossible to miss at night.','Blessing Nwosu','Boutique Owner, Enugu','BN',5,4),
  ('d0000000-0000-0000-0000-000000000005','We ordered staff uniforms for the new season and every jersey was consistent in colour and print. Delivery was right on schedule.','Coach Emeka Obi','Sports Academy Director','EO',5,5),
  ('d0000000-0000-0000-0000-000000000006','The engraved plaques for our award night looked premium and the names were perfectly spelt. Highly professional team.','Halima Yusuf','HR Manager, Kano','HY',5,6)
ON CONFLICT DO NOTHING;

-- portfolio_works
INSERT INTO public.portfolio_works (id, title, category_slug, image, note, ordinal)
VALUES
  ('e0000000-0000-0000-0000-000000000001','Corporate Event Tees','transfer-print','/products-images/tshirt.svg','300 DTF transfers, 3-day delivery',1),
  ('e0000000-0000-0000-0000-000000000002','Hoodie Merch Drop','transfer-print','/products-images/hoodie.svg','Puff print on fleece',2),
  ('e0000000-0000-0000-0000-000000000003','Face Cap Series','transfer-print','/products-images/cap.svg','Curved-platen vinyl',3),
  ('e0000000-0000-0000-0000-000000000004','Market Shopping Bags','screen-print','/products-images/shopping-bag.svg','2-colour canvas print',4),
  ('e0000000-0000-0000-0000-000000000005','Staff Uniform Program','screen-print','/products-images/uniform.svg','Left chest + back print',5),
  ('e0000000-0000-0000-0000-000000000006','Grand Opening Backdrop','clean-banners','/products-images/backdrops.svg','6m × 2.5m step-and-repeat',6),
  ('e0000000-0000-0000-0000-000000000007','Wedding Stationery Suite','clean-banners','/products-images/wedding-cards.svg','Gold foil on pearl card',7),
  ('e0000000-0000-0000-0000-000000000008','Roll-up Banner Set','clean-banners','/products-images/rollup-banners.svg','850 × 2000mm, ×12 units',8),
  ('e0000000-0000-0000-0000-000000000009','Delivery Fleet Branding','van-display','/products-images/vehicle-branding.svg','Full wrap + laminate',9),
  ('e0000000-0000-0000-0000-00000000000a','Keke Campaign Livery','van-display','/products-images/keke-branding.svg','Cut vinyl, 40 units',10),
  ('e0000000-0000-0000-0000-00000000000b','CEO Award Plaques','engraving','/products-images/plaques.svg','Laser-engraved metal plates',11),
  ('e0000000-0000-0000-0000-00000000000c','Framed Presentation Gift','engraving','/products-images/picture-framing.svg','Engraved name plate',12),
  ('e0000000-0000-0000-0000-00000000000d','Boutique Light Box','signage','/products-images/light-boxes.svg','LED, dimmable face',13),
  ('e0000000-0000-0000-0000-00000000000e','Shop Fascia Sign','signage','/products-images/shop-signs.svg','ACP panel + cut letters',14),
  ('e0000000-0000-0000-0000-00000000000f','Conference Jotters','signage','/products-images/jotters.svg','Spiral bound, full colour',15),
  ('e0000000-0000-0000-0000-000000000010','Branded Mug Gift Packs','others','/products-images/branded-mugs.svg','Full-wrap sublimation',16)
ON CONFLICT DO NOTHING;

-- before_after
INSERT INTO public.before_after (id, title, service_slug, href, before, after, note, ordinal)
VALUES
  ('f0000000-0000-0000-0000-000000000001','Plain tee → branded event shirt','transfer-print','/services/transfer-print','/products-images/before-shirt.svg','/products-images/after-shirt.svg','100% cotton tee, full-colour DTF transfer applied with a 160°C heat press.',1),
  ('f0000000-0000-0000-0000-000000000002','Blank tote → shopping bag campaign','screen-print','/services/screen-print','/products-images/before-bag.svg','/products-images/after-bag.svg','Two-colour plastisol screen print, 500 pieces produced in one week.',2),
  ('f0000000-0000-0000-0000-000000000003','Unbranded van → moving billboard','van-display','/services/van-display','/products-images/before-van.svg','/products-images/after-van.svg','Cast vinyl wrap with contact details, contour cut and UV laminated.',3),
  ('f0000000-0000-0000-0000-000000000004','Dull shopfront → glowing light box','signage','/services/signage','/products-images/before-sign.svg','/products-images/after-sign.svg','LED light box fabricated, wired and installed above the entrance.',4)
ON CONFLICT DO NOTHING;

-- printable_materials
INSERT INTO public.printable_materials (id, name, detail, ordinal)
VALUES
  ('70000000-0000-0000-0000-000000000001','Fabric & Apparel','Cotton, polycotton, fleece, canvas, twill, satin, nylon',1),
  ('70000000-0000-0000-0000-000000000002','Paper & Card','Art paper, ivory, pearl, kraft, gloss, silk and 300gsm board',2),
  ('70000000-0000-0000-0000-000000000003','Vinyl & Films','Casting vinyl, one-way vision, reflective, transparent and magnetic',3),
  ('70000000-0000-0000-0000-000000000004','Rigid substrates','Acrylic, PVC foam, foam board, ACP aluminium composite, wood',4),
  ('70000000-0000-0000-0000-000000000005','Metals','Brass, aluminium, stainless steel for tags, plaques and name badges',5),
  ('70000000-0000-0000-0000-000000000006','Glass, Crystal & Stone','Framed glass, crystal awards, marble plaques',6),
  ('70000000-0000-0000-0000-000000000007','Ceramics & Drinkware','Mugs, bottles and ceramic giftware via sublimation',7),
  ('70000000-0000-0000-0000-000000000008','Vehicles','Cars, buses, keke, vans and trucks — full or partial wraps',8)
ON CONFLICT DO NOTHING;

-- print_sizes
INSERT INTO public.print_sizes (id, group_name, size, ordinal)
SELECT gen_random_uuid(), s.group_name, s.size, s.ord
FROM (VALUES
  ('Stationery','Business card 85 × 55mm',1),
  ('Stationery','Flyer A6 / A5 / A4',2),
  ('Stationery','Poster A3 / A2 / A1',3),
  ('Stationery','Letterhead 216 × 279mm',4),
  ('Large format','Roll-up 850 × 2000mm',1),
  ('Large format','Roll-up 1000 × 2000mm',2),
  ('Large format','Banner 2 × 2m, 3 × 2m, 6 × 3m',3),
  ('Large format','Backdrop 3 × 2.5m, 6 × 2.5m',4),
  ('Apparel','Kids 2–12 years',1),
  ('Apparel','S – M – L – XL – XXL – 3XL',2),
  ('Apparel','Custom-size uniforms',3),
  ('Apparel','Cap head sizes S / M / L',4),
  ('Signage & gifts','Name tag 60 × 20mm',1),
  ('Signage & gifts','Shop sign any dimension',2),
  ('Signage & gifts','Light box custom build',3),
  ('Signage & gifts','Mug 11oz / 15oz',4)
) AS s(group_name, size, ord)
ON CONFLICT DO NOTHING;

-- print_colors
INSERT INTO public.print_colors (id, name, hex, ordinal)
VALUES
  ('80000000-0000-0000-0000-000000000001','Kabaprints Blue','#1E6FA9',1),
  ('80000000-0000-0000-0000-000000000002','Deep Blue','#14507E',2),
  ('80000000-0000-0000-0000-000000000003','Coral','#E4795B',3),
  ('80000000-0000-0000-0000-000000000004','Slate Grey','#96A1A6',4),
  ('80000000-0000-0000-0000-000000000005','Ink Black','#101A24',5),
  ('80000000-0000-0000-0000-000000000006','Pure White','#FFFFFF',6),
  ('80000000-0000-0000-0000-000000000007','Sun Yellow','#F4C542',7),
  ('80000000-0000-0000-0000-000000000008','Leaf Green','#2FA36B',8)
ON CONFLICT DO NOTHING;

-- color_notes
INSERT INTO public.color_notes (id, note, ordinal)
VALUES
  ('90000000-0000-0000-0000-000000000001','Full CMYK process colour for photographic artwork',1),
  ('90000000-0000-0000-0000-000000000002','Pantone spot matching on request (send us your PMS number)',2),
  ('90000000-0000-0000-0000-000000000003','Neon, metallic gold/silver and glow-in-the-dark options',3),
  ('90000000-0000-0000-0000-000000000004','RAL colours available for signage fabrication',4)
ON CONFLICT DO NOTHING;

-- design_services
INSERT INTO public.design_services (id, title, detail, ordinal)
VALUES
  ('00000000-0000-0000-0000-000000000001','Logo Design & Refresh','Distinctive marks with full file handover — SVG, PNG, PDF and print-ready EPS.',1),
  ('00000000-0000-0000-0000-000000000002','Brand Identity Systems','Colour palette, typography, stationery and a usage guide your team can follow.',2),
  ('00000000-0000-0000-0000-000000000003','Flyers, Posters & Handbills','Campaign artwork built to print, from concept to press-ready PDF with bleed.',3),
  ('00000000-0000-0000-0000-000000000004','Social Media Graphics','Consistent post templates, stories and ad creatives sized for every platform.',4),
  ('00000000-0000-0000-0000-000000000005','Product & Packaging Artwork','Labels, cartons and wraps that stand out on the shelf and print flawlessly.',5),
  ('00000000-0000-0000-0000-000000000006','Vehicle & Signage Layouts','Scaled mock-ups of wraps, fascia signs and light boxes before anything is cut.',6)
ON CONFLICT DO NOTHING;

-- design_process
INSERT INTO public.design_process (id, step, title, detail, ordinal)
VALUES
  ('10000000-0000-0000-0000-000000000001','01','Brief','Tell us the goal, audience, deadline and any ideas you already have.',1),
  ('10000000-0000-0000-0000-000000000002','02','Concept','Our designers explore directions and share the strongest options with you.',2),
  ('10000000-0000-0000-0000-000000000003','03','Revise','You review and we refine until every detail feels right — revisions included.',3),
  ('10000000-0000-0000-0000-000000000004','04','Deliver','You receive print-ready and digital files, ready to go straight into production.',4)
ON CONFLICT DO NOTHING;
`;

export const MIGRATION_0004_open_24_7_sql = `-- ============================================================
-- 0004 — open 24/7 + auth trigger fix (idempotent; safe to re-run)
-- Project: https://ccabevypxuwzpbagkiji.supabase.co
--
-- 1. Opening hours: the shop now trades 24 hours a day, 7 days a week.
--    Rows seeded with the old "9:00 am – 7:00 pm / Mondays – Saturdays" values
--    are updated. Different values (i.e. ones the owner has since chosen in
--    Admin → Settings) are left untouched.
--
-- 2. handle_new_user(): the trigger referenced a non-existent column
--    (\`raw_user_meta_\`) which made every new signup fail. \`raw_user_meta_data\`
--    is the correct column on auth.users.
-- ============================================================

UPDATE public.site_settings
SET hours = '24/7',
    hours_days = 'Monday – Sunday',
    updated_at = now()
WHERE hours IN ('9:00 am – 7:00 pm', '9:00am – 7:00pm', '9am – 7pm', '9am - 7pm')
   OR hours_days IN ('Mondays – Saturdays', 'Monday – Saturday', 'Mon - Sat', 'Mon – Sat');

-- Make the table default match too (only affects brand-new rows).
ALTER TABLE public.site_settings ALTER COLUMN hours SET DEFAULT '24/7';
ALTER TABLE public.site_settings ALTER COLUMN hours_days SET DEFAULT 'Monday – Sunday';

-- ---------- auth trigger fix ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'phone',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

VACUUM ANALYZE public.site_settings;
`;

/** Ordered list of the bundled migrations. */
export const MIGRATIONS: { name: string; sql: string }[] = [
  { name: "0001_schema.sql", sql: MIGRATION_0001_schema_sql },
  { name: "0002_rls_policies.sql", sql: MIGRATION_0002_rls_policies_sql },
  { name: "0003_seed.sql", sql: MIGRATION_0003_seed_sql },
  { name: "0004_open_24_7.sql", sql: MIGRATION_0004_open_24_7_sql },
];

/** Names of the bundled migrations, in order. */
export const MIGRATION_FILES: string[] = MIGRATIONS.map((m) => m.name);
