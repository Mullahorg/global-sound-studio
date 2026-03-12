
-- 1. Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications"
ON public.notifications FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Admin RLS for bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Admin RLS for conversations
CREATE POLICY "Admins can view all conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Admin RLS for messages
CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Admin RLS for conversation_participants
CREATE POLICY "Admins can view all participants"
ON public.conversation_participants FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 7. Admin RLS for beat_purchases (so admin can see all sales)
CREATE POLICY "Admins can view all purchases"
ON public.beat_purchases FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Admin RLS for projects
CREATE POLICY "Admins can view all projects"
ON public.projects FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
