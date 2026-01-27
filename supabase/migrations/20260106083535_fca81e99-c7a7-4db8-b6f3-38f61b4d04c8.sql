-- Add client_type and badge columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS client_type TEXT DEFAULT 'full_client' CHECK (client_type IN ('full_client', 'partner')),
ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT NULL CHECK (badge IS NULL OR badge IN ('global_staff', 'partner', 'verified_artist', 'top_producer')),
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Kenya',
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Africa';

-- Create index for faster regional queries
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);