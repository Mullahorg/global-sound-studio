-- Session pricing table for dynamic content
CREATE TABLE public.session_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_kes NUMERIC NOT NULL DEFAULT 0,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  icon TEXT DEFAULT '🎵',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Site announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Session pricing policies
CREATE POLICY "Session pricing is viewable by everyone" 
ON public.session_pricing FOR SELECT USING (true);

CREATE POLICY "Admins can manage session pricing" 
ON public.session_pricing FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Announcements policies
CREATE POLICY "Active announcements are viewable by everyone" 
ON public.announcements FOR SELECT 
USING (is_active = true AND (ends_at IS NULL OR ends_at > now()));

CREATE POLICY "Admins can manage announcements" 
ON public.announcements FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Insert default session pricing
INSERT INTO public.session_pricing (session_type, name, description, price_kes, duration_hours, icon) VALUES
('recording', 'Recording Session', 'Professional vocal and instrument recording in our state-of-the-art studio', 15000, 2, '🎤'),
('mixing', 'Mixing Session', 'Full mix with engineer consultation and revisions', 20000, 3, '🎚️'),
('mastering', 'Mastering', 'Final polish for release-ready tracks', 10000, 1, '💿'),
('production', 'Production Session', 'Collaborative beat-making and music production', 25000, 4, '🎹'),
('consultation', 'Consultation', 'One-on-one career advice and music guidance', 7500, 1, '💬');

-- Insert default platform settings if not exist
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description, is_sensitive) VALUES
('site_name', 'WE Global Music Empire', 'string', 'Website name', false),
('hero_title', 'Professional Music Production', 'string', 'Homepage hero title', false),
('hero_subtitle', 'Create, collaborate, and release world-class music with Africa''s finest producers', 'string', 'Homepage hero subtitle', false),
('contact_email', 'studio@weglobal.com', 'string', 'Contact email', false),
('contact_phone', '+254 700 000 000', 'string', 'Contact phone', false),
('studio_description', 'State-of-the-art recording facility in the heart of Nairobi', 'string', 'Studio page description', false),
('commission_rate', '30', 'number', 'Platform commission rate (%)', false),
('minimum_payout', '1000', 'number', 'Minimum payout amount (KES)', false),
('mpesa_environment', 'sandbox', 'string', 'M-Pesa API environment', false),
('mpesa_shortcode', '174379', 'string', 'M-Pesa business shortcode', true),
('paybill_number', '', 'string', 'Paybill number for backup payments', false),
('bank_name', '', 'string', 'Bank name for paybill', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_session_pricing_updated_at
BEFORE UPDATE ON public.session_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();