-- Create trigger function to auto-create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
  RETURN NEW;
END;
$function$;

-- Create trigger if not exists (drop and recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure existing auth users have profiles
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'full_name', '')
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Make beat columns more flexible with sensible defaults
ALTER TABLE public.beats 
  ALTER COLUMN bpm SET DEFAULT 120,
  ALTER COLUMN price_basic SET DEFAULT 29.99,
  ALTER COLUMN price_premium SET DEFAULT 99.99,
  ALTER COLUMN price_exclusive SET DEFAULT 499.99;

-- Ensure order number has a default
ALTER TABLE public.orders 
  ALTER COLUMN order_number SET DEFAULT 'WGME-' || substr(gen_random_uuid()::text, 1, 8);

-- Ensure booking total_price has a default
ALTER TABLE public.bookings
  ALTER COLUMN total_price SET DEFAULT 0;

-- Add RLS policy for admins to manage user_roles
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" 
  ON public.user_roles 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'));