-- Fix the overly permissive INSERT policy by restricting to admin only for inserts
DROP POLICY IF EXISTS "Service role can insert payments" ON public.payments;

-- Create a more secure insert policy - only the user creating their own payment record
CREATE POLICY "Users can insert own payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);