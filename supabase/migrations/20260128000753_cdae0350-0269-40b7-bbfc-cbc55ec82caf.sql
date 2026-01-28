-- ===========================================
-- REFERRAL SYSTEM TABLES
-- ===========================================

-- Referral codes table
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  reward_per_referral NUMERIC DEFAULT 100, -- KES reward per successful referral
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Referrals tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_id UUID REFERENCES public.referral_codes(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded', 'expired')),
  qualification_type TEXT DEFAULT 'signup', -- signup, first_purchase, first_booking
  reward_amount NUMERIC DEFAULT 0,
  reward_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Referral rewards/bonuses table
CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.referrals(id),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('cash', 'discount', 'free_beat', 'premium_access')),
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  expires_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- FRANCHISE/PRODUCER EARNINGS SYSTEM
-- ===========================================

-- Producer franchise settings
CREATE TABLE public.producer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_franchise_active BOOLEAN DEFAULT false,
  commission_rate NUMERIC DEFAULT 70.00, -- Producer keeps 70%, platform 30%
  minimum_payout NUMERIC DEFAULT 1000, -- Minimum KES for payout
  payout_method TEXT DEFAULT 'mpesa',
  mpesa_number TEXT,
  bank_name TEXT,
  bank_account TEXT,
  hourly_rate NUMERIC DEFAULT 2000, -- Default hourly rate for bookings
  booking_enabled BOOLEAN DEFAULT true,
  available_days JSONB DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',
  available_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00"}',
  bio_short TEXT,
  specializations TEXT[],
  portfolio_url TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Producer booking earnings (tied to bookings)
CREATE TABLE public.booking_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  producer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gross_amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 70.00,
  net_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  payout_id UUID REFERENCES public.payouts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- ENABLE RLS
-- ===========================================

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_earnings ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES - Referral Codes
-- ===========================================

CREATE POLICY "Users can view own referral codes"
ON public.referral_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes"
ON public.referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes"
ON public.referral_codes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can lookup referral codes"
ON public.referral_codes FOR SELECT
USING (is_active = true);

-- ===========================================
-- RLS POLICIES - Referrals
-- ===========================================

CREATE POLICY "Users can view referrals they made"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals made for them"
ON public.referrals FOR SELECT
USING (auth.uid() = referred_id);

CREATE POLICY "System can create referrals"
ON public.referrals FOR INSERT
WITH CHECK (auth.uid() = referred_id);

CREATE POLICY "Admins can manage referrals"
ON public.referrals FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ===========================================
-- RLS POLICIES - Referral Rewards
-- ===========================================

CREATE POLICY "Users can view own rewards"
ON public.referral_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can claim own rewards"
ON public.referral_rewards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage rewards"
ON public.referral_rewards FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ===========================================
-- RLS POLICIES - Producer Settings
-- ===========================================

CREATE POLICY "Producers can view own settings"
ON public.producer_settings FOR SELECT
USING (auth.uid() = producer_id);

CREATE POLICY "Producers can create own settings"
ON public.producer_settings FOR INSERT
WITH CHECK (auth.uid() = producer_id);

CREATE POLICY "Producers can update own settings"
ON public.producer_settings FOR UPDATE
USING (auth.uid() = producer_id);

CREATE POLICY "Public can view active franchise producers"
ON public.producer_settings FOR SELECT
USING (is_franchise_active = true AND booking_enabled = true);

CREATE POLICY "Admins can manage all producer settings"
ON public.producer_settings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ===========================================
-- RLS POLICIES - Booking Earnings
-- ===========================================

CREATE POLICY "Producers can view own booking earnings"
ON public.booking_earnings FOR SELECT
USING (auth.uid() = producer_id);

CREATE POLICY "Admins can manage booking earnings"
ON public.booking_earnings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Update timestamps
CREATE TRIGGER update_referral_codes_updated_at
BEFORE UPDATE ON public.referral_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_producer_settings_updated_at
BEFORE UPDATE ON public.producer_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_earnings_updated_at
BEFORE UPDATE ON public.booking_earnings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- ENABLE REALTIME FOR KEY TABLES
-- ===========================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_earnings;