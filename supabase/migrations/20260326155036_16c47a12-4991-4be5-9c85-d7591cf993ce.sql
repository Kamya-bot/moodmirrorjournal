-- Collections
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT '📁',
  color text DEFAULT 'hsl(220, 70%, 50%)',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own collections" ON public.collections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tags
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tags" ON public.tags FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Entry-Tags junction
CREATE TABLE public.entry_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(entry_id, tag_id)
);
ALTER TABLE public.entry_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own entry_tags" ON public.entry_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.journal_entries je WHERE je.id = entry_id AND je.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.journal_entries je WHERE je.id = entry_id AND je.user_id = auth.uid()));

-- Add collection_id and is_vault to journal_entries
ALTER TABLE public.journal_entries ADD COLUMN collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL;
ALTER TABLE public.journal_entries ADD COLUMN is_vault boolean NOT NULL DEFAULT false;

-- Templates
CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own and system templates" ON public.templates FOR SELECT
  USING (is_system = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own templates" ON public.templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.templates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own templates" ON public.templates FOR DELETE USING (user_id = auth.uid());

-- Challenges
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  duration_days int NOT NULL,
  category text NOT NULL,
  icon text DEFAULT '🎯',
  prompts jsonb DEFAULT '[]'
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT TO authenticated USING (true);

-- User challenges
CREATE TABLE public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  current_day int NOT NULL DEFAULT 1,
  entries_completed jsonb DEFAULT '[]'
);
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own user_challenges" ON public.user_challenges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User progress (XP / leveling)
CREATE TABLE public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp int NOT NULL DEFAULT 0,
  level int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reminders
CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_time time NOT NULL DEFAULT '09:00',
  reminder_type text NOT NULL DEFAULT 'daily',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reminders" ON public.reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Missions
CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  mission_type text NOT NULL,
  target int NOT NULL DEFAULT 1,
  xp_reward int NOT NULL DEFAULT 10,
  period text NOT NULL DEFAULT 'weekly',
  icon text DEFAULT '🎯'
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view missions" ON public.missions FOR SELECT TO authenticated USING (true);

-- User missions
CREATE TABLE public.user_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  progress int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  period_start timestamptz NOT NULL DEFAULT date_trunc('week', now()),
  UNIQUE(user_id, mission_id, period_start)
);
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own user_missions" ON public.user_missions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create user_progress on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_emoji)
  VALUES (NEW.id, '', '😊');
  INSERT INTO public.user_progress (user_id, xp, level)
  VALUES (NEW.id, 0, 1);
  RETURN NEW;
END;
$$;