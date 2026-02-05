-- Fix support_tickets order_id type and add missing foreign keys

-- First fix the order_id column type in support_tickets (currently text, should be uuid)
ALTER TABLE public.support_tickets 
  ALTER COLUMN order_id TYPE uuid USING order_id::uuid;

-- Now add the foreign key constraints

-- chat_flags - missing flagged_by and reviewed_by
ALTER TABLE public.chat_flags 
  ADD CONSTRAINT chat_flags_flagged_by_fkey 
    FOREIGN KEY (flagged_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.chat_flags 
  ADD CONSTRAINT chat_flags_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- conversation_participants - missing user_id
ALTER TABLE public.conversation_participants 
  ADD CONSTRAINT conversation_participants_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- disputes - missing reporter_id, reported_user_id, resolved_by
ALTER TABLE public.disputes 
  ADD CONSTRAINT disputes_reporter_id_fkey 
    FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.disputes 
  ADD CONSTRAINT disputes_reported_user_id_fkey 
    FOREIGN KEY (reported_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.disputes 
  ADD CONSTRAINT disputes_resolved_by_fkey 
    FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- earnings - missing producer_id
ALTER TABLE public.earnings 
  ADD CONSTRAINT earnings_producer_id_fkey 
    FOREIGN KEY (producer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- manual_payments - missing user_id, reviewed_by
ALTER TABLE public.manual_payments 
  ADD CONSTRAINT manual_payments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.manual_payments 
  ADD CONSTRAINT manual_payments_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- messages - missing sender_id
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- orders - missing user_id
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- outreach_applications - missing applicant_id, reviewed_by
ALTER TABLE public.outreach_applications 
  ADD CONSTRAINT outreach_applications_applicant_id_fkey 
    FOREIGN KEY (applicant_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.outreach_applications 
  ADD CONSTRAINT outreach_applications_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- payouts - missing producer_id, processed_by
ALTER TABLE public.payouts 
  ADD CONSTRAINT payouts_producer_id_fkey 
    FOREIGN KEY (producer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.payouts 
  ADD CONSTRAINT payouts_processed_by_fkey 
    FOREIGN KEY (processed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- play_history - missing user_id
ALTER TABLE public.play_history 
  ADD CONSTRAINT play_history_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- reviews - missing user_id
ALTER TABLE public.reviews 
  ADD CONSTRAINT reviews_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- support_tickets - missing assigned_to, order_id
ALTER TABLE public.support_tickets 
  ADD CONSTRAINT support_tickets_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.support_tickets 
  ADD CONSTRAINT support_tickets_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- transactions - missing user_id
ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- wishlist - missing user_id
ALTER TABLE public.wishlist 
  ADD CONSTRAINT wishlist_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;