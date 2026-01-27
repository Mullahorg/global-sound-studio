-- Create play_history table to track user listening history
CREATE TABLE public.play_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  beat_id UUID NOT NULL REFERENCES public.beats(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own play history
CREATE POLICY "Users can view own play history"
ON public.play_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their play history
CREATE POLICY "Users can add play history"
ON public.play_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their play history
CREATE POLICY "Users can update own play history"
ON public.play_history
FOR UPDATE
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_play_history_user_id ON public.play_history(user_id);
CREATE INDEX idx_play_history_beat_id ON public.play_history(beat_id);
CREATE INDEX idx_play_history_played_at ON public.play_history(played_at DESC);