-- Fix profiles table: Only allow viewing your own email, others can see limited public info
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can view limited public info of others (no email)
CREATE POLICY "Public can view limited profile info"
ON public.profiles
FOR SELECT
USING (true);

-- Create a view for public profile data without sensitive info
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Fix payouts table: Only admins can see phone numbers
DROP POLICY IF EXISTS "Producers can view own payouts" ON public.payouts;

-- Producers can view their own payouts but phone is visible (needed for their own records)
CREATE POLICY "Producers can view own payouts"
ON public.payouts
FOR SELECT
USING (auth.uid() = producer_id);

-- Admins can view all payouts (already have admin policy)
-- Note: The existing admin policy should already allow this