-- Create support_tickets table for proper ticket tracking
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  order_id TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  admin_notes TEXT,
  assigned_to UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit tickets (for non-logged-in users too)
CREATE POLICY "Anyone can submit support tickets"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own tickets (by email or user_id)
CREATE POLICY "Users can view own tickets by user_id"
  ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update tickets
CREATE POLICY "Admins can update tickets"
  ON public.support_tickets
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete tickets
CREATE POLICY "Admins can delete tickets"
  ON public.support_tickets
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();