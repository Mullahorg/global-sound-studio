-- Fix the orders license_type constraint to allow 'none' for non-beat orders (bookings, etc.)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_license_type_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_license_type_check 
CHECK (license_type = ANY (ARRAY['basic'::text, 'premium'::text, 'exclusive'::text, 'none'::text]));

-- Make manual_payments.order_id nullable (it already is) and remove FK if causing issues
-- The FK should be kept but we need to ensure orders exist before linking
-- Just ensure the column allows NULL properly
ALTER TABLE public.manual_payments ALTER COLUMN order_id DROP NOT NULL;