-- Create outreach_programs table for talent discovery
CREATE TABLE public.outreach_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  program_type TEXT NOT NULL DEFAULT 'talent_discovery',
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outreach_applications table
CREATE TABLE public.outreach_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.outreach_programs(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  talent_type TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  portfolio_url TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  demo_url TEXT,
  bio TEXT,
  why_apply TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outreach_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_applications ENABLE ROW LEVEL SECURITY;

-- Programs are viewable by everyone
CREATE POLICY "Outreach programs are viewable by everyone"
ON public.outreach_programs FOR SELECT
USING (true);

-- Only admins can manage programs
CREATE POLICY "Admins can insert programs"
ON public.outreach_programs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update programs"
ON public.outreach_programs FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete programs"
ON public.outreach_programs FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Users can submit applications
CREATE POLICY "Users can submit applications"
ON public.outreach_applications FOR INSERT
WITH CHECK (auth.uid() = applicant_id);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON public.outreach_applications FOR SELECT
USING (auth.uid() = applicant_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.outreach_applications FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.outreach_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_outreach_programs_updated_at
BEFORE UPDATE ON public.outreach_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();