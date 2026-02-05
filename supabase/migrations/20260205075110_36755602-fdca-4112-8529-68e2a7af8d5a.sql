-- Fix overly permissive RLS policies for contact_messages and support_tickets
-- These public forms need some protection but should still allow anonymous submissions

-- Drop the overly permissive policy on contact_messages
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;

-- Create a more restrictive insert policy (still allows public but validates required fields at DB level)
CREATE POLICY "Public can submit contact messages with valid data" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (
  name IS NOT NULL AND 
  name != '' AND 
  email IS NOT NULL AND 
  email != '' AND 
  subject IS NOT NULL AND 
  subject != '' AND 
  message IS NOT NULL AND 
  message != '' AND
  LENGTH(message) <= 5000 AND
  LENGTH(name) <= 255 AND
  LENGTH(email) <= 255 AND
  LENGTH(subject) <= 500
);

-- Drop the overly permissive policy on support_tickets
DROP POLICY IF EXISTS "Anyone can submit support tickets" ON public.support_tickets;

-- Create a more restrictive insert policy for support tickets
CREATE POLICY "Public can submit support tickets with valid data" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (
  name IS NOT NULL AND 
  name != '' AND 
  email IS NOT NULL AND 
  email != '' AND 
  category IS NOT NULL AND 
  category != '' AND 
  message IS NOT NULL AND 
  message != '' AND
  LENGTH(message) <= 5000 AND
  LENGTH(name) <= 255 AND
  LENGTH(email) <= 255
);