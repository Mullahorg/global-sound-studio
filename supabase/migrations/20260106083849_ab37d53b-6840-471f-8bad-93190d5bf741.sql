-- Allow beats with null producer_id for sample/demo beats
ALTER TABLE public.beats ALTER COLUMN producer_id DROP NOT NULL;

-- Add a flag for sample/demo beats
ALTER TABLE public.beats ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;