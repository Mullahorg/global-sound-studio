-- Create disputes table for managing user conflicts
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  dispute_type TEXT NOT NULL DEFAULT 'general',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  resolution TEXT,
  admin_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_flags table for flagging inappropriate messages
CREATE TABLE public.chat_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  flagged_by UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disputes
CREATE POLICY "Users can view their own disputes"
ON public.disputes FOR SELECT
USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);

CREATE POLICY "Users can create disputes"
ON public.disputes FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all disputes"
ON public.disputes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update disputes"
ON public.disputes FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for chat_flags
CREATE POLICY "Users can flag messages"
ON public.chat_flags FOR INSERT
WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Admins can view all flags"
ON public.chat_flags FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update flags"
ON public.chat_flags FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for admin monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_flags;

-- Create trigger for updated_at
CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();