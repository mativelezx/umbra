-- ═══════════════════════════════════════
-- UMBRA — Schema inicial
-- ═══════════════════════════════════════

-- Usuarios (extendido de Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Perfil psicológico
CREATE TABLE public.psychological_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  openness INTEGER CHECK (openness BETWEEN 0 AND 100),
  conscientiousness INTEGER CHECK (conscientiousness BETWEEN 0 AND 100),
  extraversion INTEGER CHECK (extraversion BETWEEN 0 AND 100),
  agreeableness INTEGER CHECK (agreeableness BETWEEN 0 AND 100),
  neuroticism INTEGER CHECK (neuroticism BETWEEN 0 AND 100),
  jung_functions JSONB NOT NULL DEFAULT '{}',
  archetype TEXT CHECK (archetype IN ('hero','sage','explorer','creator','caregiver','rebel')),
  archetype_secondary TEXT,
  analysis_raw JSONB,
  input_mode TEXT CHECK (input_mode IN ('guided', 'freetext')),
  input_texts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Narrativa generada
CREATE TABLE public.narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.psychological_profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversaciones
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensajes
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan de desarrollo
CREATE TABLE public.development_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.psychological_profiles(id),
  areas JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ ROW LEVEL SECURITY ═══
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychological_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own data" ON public.profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own profiles" ON public.psychological_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own narratives" ON public.narratives
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own messages" ON public.messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Users manage own plans" ON public.development_plans
  FOR ALL USING (auth.uid() = user_id);

-- ═══ INDEXES ═══
CREATE INDEX idx_psych_profiles_user ON public.psychological_profiles(user_id);
CREATE INDEX idx_narratives_user ON public.narratives(user_id);
CREATE INDEX idx_conversations_user ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_plans_user ON public.development_plans(user_id);
