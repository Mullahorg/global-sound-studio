
-- =============================================
-- 1. MISSING TABLES: licenses, orders, transactions, manual_payments, reviews, earnings
-- =============================================

-- Licenses table (for beat licensing types)
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  beat_id UUID REFERENCES public.beats(id) ON DELETE CASCADE NOT NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('basic', 'premium', 'exclusive')),
  price NUMERIC NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  file_types TEXT[] DEFAULT ARRAY['mp3'],
  stems_included BOOLEAN DEFAULT false,
  commercial_use BOOLEAN DEFAULT true,
  streaming_limit INTEGER DEFAULT NULL,
  distribution_copies INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table (for tracking purchases)
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE DEFAULT 'WGME-' || substr(gen_random_uuid()::text, 1, 8),
  user_id UUID NOT NULL,
  beat_id UUID REFERENCES public.beats(id) ON DELETE SET NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('basic', 'premium', 'exclusive')),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT DEFAULT 'mpesa',
  download_url TEXT,
  download_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions table (for payment records)
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'payout', 'fee')),
  payment_method TEXT NOT NULL DEFAULT 'mpesa',
  mpesa_receipt_number TEXT,
  phone_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Manual payments table (for Paybill/Bank backup)
CREATE TABLE public.manual_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  reference_code TEXT NOT NULL,
  proof_url TEXT,
  proof_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews table (for beat reviews)
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  beat_id UUID REFERENCES public.beats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(beat_id, user_id)
);

-- Earnings table (for producer earnings tracking)
CREATE TABLE public.earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  beat_id UUID REFERENCES public.beats(id) ON DELETE SET NULL,
  gross_amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'paid_out')),
  payout_id UUID REFERENCES public.payouts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 2. ENABLE RLS ON ALL NEW TABLES
-- =============================================

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. RLS POLICIES
-- =============================================

-- Licenses: public read, admin write
CREATE POLICY "Licenses are viewable by everyone" ON public.licenses FOR SELECT USING (true);
CREATE POLICY "Admins can manage licenses" ON public.licenses FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Orders: users see own, admins see all
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Transactions: users see own, admins see all
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert transactions" ON public.transactions FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Manual payments: users see own, admins manage
CREATE POLICY "Users can view own manual payments" ON public.manual_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit manual payments" ON public.manual_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all manual payments" ON public.manual_payments FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update manual payments" ON public.manual_payments FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Reviews: public read, verified users write
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Earnings: producers see own, admins see all
CREATE POLICY "Producers can view own earnings" ON public.earnings FOR SELECT USING (auth.uid() = producer_id);
CREATE POLICY "Admins can view all earnings" ON public.earnings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage earnings" ON public.earnings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. STORAGE BUCKET FOR PAYMENT PROOFS
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Payment proofs: users can upload, admins can view all
CREATE POLICY "Users can upload payment proofs" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own payment proofs" ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all payment proofs" ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND has_role(auth.uid(), 'admin'));

-- =============================================
-- 5. ASSIGN ADMIN ROLE TO johnmulama001@gmail.com
-- =============================================

INSERT INTO public.user_roles (user_id, role)
VALUES ('c72a8f54-080c-4600-b94f-82098f902f18', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- 6. INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_manual_payments_user_id ON public.manual_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_payments_status ON public.manual_payments(status);
CREATE INDEX IF NOT EXISTS idx_reviews_beat_id ON public.reviews(beat_id);
CREATE INDEX IF NOT EXISTS idx_earnings_producer_id ON public.earnings(producer_id);
CREATE INDEX IF NOT EXISTS idx_licenses_beat_id ON public.licenses(beat_id);

-- =============================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manual_payments_updated_at BEFORE UPDATE ON public.manual_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
