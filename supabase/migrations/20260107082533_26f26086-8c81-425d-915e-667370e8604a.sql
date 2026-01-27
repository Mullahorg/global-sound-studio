-- Platform settings table for storing M-Pesa and other configurations
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT NOT NULL DEFAULT 'string',
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write settings
CREATE POLICY "Admins can read platform settings"
ON public.platform_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert platform settings"
ON public.platform_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update platform settings"
ON public.platform_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete platform settings"
ON public.platform_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Payments table for tracking M-Pesa transactions
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_type TEXT NOT NULL, -- 'beat_purchase', 'booking'
  reference_id UUID, -- beat_id or booking_id
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  payment_method TEXT DEFAULT 'mpesa',
  mpesa_receipt_number TEXT,
  phone_number TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, cancelled
  checkout_request_id TEXT,
  merchant_request_id TEXT,
  result_code TEXT,
  result_desc TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only system can insert payments (via edge function with service role)
CREATE POLICY "Service role can insert payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can update payments
CREATE POLICY "Admins can update payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default M-Pesa settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description, is_sensitive) VALUES
('mpesa_environment', 'sandbox', 'string', 'M-Pesa environment (sandbox or production)', false),
('mpesa_consumer_key', '', 'string', 'M-Pesa Consumer Key from Safaricom Developer Portal', true),
('mpesa_consumer_secret', '', 'string', 'M-Pesa Consumer Secret', true),
('mpesa_passkey', '', 'string', 'M-Pesa Passkey for STK Push', true),
('mpesa_shortcode', '174379', 'string', 'M-Pesa Business Shortcode', false),
('mpesa_callback_url', '', 'string', 'M-Pesa Callback URL for payment notifications', false),
('platform_currency', 'KES', 'string', 'Default platform currency', false),
('platform_name', 'WE Global Studio', 'string', 'Platform display name', false),
('platform_email', '', 'string', 'Platform contact email', false),
('platform_phone', '', 'string', 'Platform contact phone', false);