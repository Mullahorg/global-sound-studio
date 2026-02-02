-- Make license_type nullable since bookings and other non-beat orders don't need it
ALTER TABLE public.orders 
ALTER COLUMN license_type DROP NOT NULL;

-- Update the default to 'none' for orders without a license
ALTER TABLE public.orders 
ALTER COLUMN license_type SET DEFAULT 'none';

-- Add order_type column if not exists to distinguish order types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='order_type') THEN
    ALTER TABLE public.orders ADD COLUMN order_type varchar(50) DEFAULT 'product';
  END IF;
END $$;

-- Ensure profiles table has proper defaults to prevent insert failures
ALTER TABLE public.profiles
ALTER COLUMN country SET DEFAULT 'Kenya',
ALTER COLUMN region SET DEFAULT 'Africa',
ALTER COLUMN client_type SET DEFAULT 'full_client';

-- Ensure bookings can be created without order_id (for manual bookings)
ALTER TABLE public.bookings
ALTER COLUMN order_id DROP NOT NULL;

-- Ensure total_price has a default
ALTER TABLE public.bookings
ALTER COLUMN total_price SET DEFAULT 0;

-- Add index for faster order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_status ON public.bookings(client_id, status);
CREATE INDEX IF NOT EXISTS idx_manual_payments_user_status ON public.manual_payments(user_id, status);