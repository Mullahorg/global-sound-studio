-- Fix 1: Drop the problematic foreign key constraint on manual_payments
-- order_id should be optional and not enforce FK since payments can exist without orders
ALTER TABLE public.manual_payments DROP CONSTRAINT IF EXISTS manual_payments_order_id_fkey;

-- Fix 2: Fix infinite recursion in conversation_participants RLS policy
-- First, create a security definer function to check conversation participation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id 
    AND user_id = _user_id
  )
$$;

-- Drop the problematic self-referential policy
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;

-- Create new policy using the security definer function
CREATE POLICY "Users can view participants of their conversations" 
ON public.conversation_participants 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.is_conversation_participant(conversation_id, auth.uid())
);