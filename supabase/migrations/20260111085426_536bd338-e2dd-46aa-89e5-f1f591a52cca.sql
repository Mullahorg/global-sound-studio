-- Create payouts table for producer withdrawals
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'mpesa',
  phone_number TEXT,
  mpesa_receipt_number TEXT,
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Producers can view their own payouts
CREATE POLICY "Producers can view own payouts"
ON public.payouts
FOR SELECT
USING (auth.uid() = producer_id);

-- Producers can request payouts
CREATE POLICY "Producers can request payouts"
ON public.payouts
FOR INSERT
WITH CHECK (auth.uid() = producer_id);

-- Admins can view all payouts
CREATE POLICY "Admins can view all payouts"
ON public.payouts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update payouts
CREATE POLICY "Admins can update payouts"
ON public.payouts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON public.payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();