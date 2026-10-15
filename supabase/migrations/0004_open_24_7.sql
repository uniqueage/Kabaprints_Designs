-- ============================================================
-- 0004 — open 24/7 + auth trigger fix (idempotent; safe to re-run)
-- Project: https://ccabevypxuwzpbagkiji.supabase.co
--
-- 1. Opening hours: the shop now trades 24 hours a day, 7 days a week.
--    Rows seeded with the old "9:00 am – 7:00 pm / Mondays – Saturdays" values
--    are updated. Different values (i.e. ones the owner has since chosen in
--    Admin → Settings) are left untouched.
--
-- 2. handle_new_user(): the trigger referenced a non-existent column
--    (`raw_user_meta_`) which made every new signup fail. `raw_user_meta_data`
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
