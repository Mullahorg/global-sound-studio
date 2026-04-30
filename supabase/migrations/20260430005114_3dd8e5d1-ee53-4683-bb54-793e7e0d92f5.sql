ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'dark' CHECK (theme_preference IN ('dark','light')),
  ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en' CHECK (language_preference IN ('en','sw'));