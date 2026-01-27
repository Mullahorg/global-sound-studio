-- Fix security definer view by using SECURITY INVOKER instead
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate view with SECURITY INVOKER (default, explicit for clarity)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  badge,
  client_type,
  country,
  region,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;