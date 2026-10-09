-- ============================================================
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
