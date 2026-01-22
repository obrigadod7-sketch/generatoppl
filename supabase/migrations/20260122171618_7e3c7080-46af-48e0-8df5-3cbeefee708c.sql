-- MVP AppMyKids (stack atual) - schema inicial

-- 1) Expandir enum de papéis
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    -- add values if missing
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'app_role' AND e.enumlabel = 'leader'
    ) THEN
      ALTER TYPE public.app_role ADD VALUE 'leader';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'app_role' AND e.enumlabel = 'volunteer'
    ) THEN
      ALTER TYPE public.app_role ADD VALUE 'volunteer';
    END IF;
  END IF;
END
$$;

-- 2) Tabelas base
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Crianças e responsáveis
CREATE TABLE IF NOT EXISTS public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  birth_date DATE,
  allergies TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.child_guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  relationship TEXT,
  is_pickup_authorized BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, guardian_id)
);

-- 4) Eventos
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  location TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Check-in / Check-out
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'checked_in',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  checkout_guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
  checkout_code_hash TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) Mensagens (log interno)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
  sender_user_id UUID,
  channel TEXT NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7) Leads (form público)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'site',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_children_church_id ON public.children(church_id);
CREATE INDEX IF NOT EXISTS idx_guardians_church_id ON public.guardians(church_id);
CREATE INDEX IF NOT EXISTS idx_events_church_id ON public.events(church_id);
CREATE INDEX IF NOT EXISTS idx_checkins_child_id ON public.checkins(child_id);
CREATE INDEX IF NOT EXISTS idx_checkins_event_id ON public.checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON public.checkins(checked_in_at);

-- 8) updated_at triggers
-- Reuse existing function public.update_updated_at_column()
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_churches_updated_at') THEN
    CREATE TRIGGER trg_churches_updated_at BEFORE UPDATE ON public.churches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_children_updated_at') THEN
    CREATE TRIGGER trg_children_updated_at BEFORE UPDATE ON public.children
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_guardians_updated_at') THEN
    CREATE TRIGGER trg_guardians_updated_at BEFORE UPDATE ON public.guardians
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_events_updated_at') THEN
    CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_checkins_updated_at') THEN
    CREATE TRIGGER trg_checkins_updated_at BEFORE UPDATE ON public.checkins
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- 9) RLS
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- helper: current church id (security definer to avoid RLS complexity)
CREATE OR REPLACE FUNCTION public.current_church_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT p.church_id
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1
$$;

-- 10) Policies
-- churches
DROP POLICY IF EXISTS "Admins manage churches" ON public.churches;
CREATE POLICY "Admins manage churches"
ON public.churches
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users can view own church" ON public.churches;
CREATE POLICY "Users can view own church"
ON public.churches
FOR SELECT
USING (id = public.current_church_id() OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- children
DROP POLICY IF EXISTS "Staff manage children in church" ON public.children;
CREATE POLICY "Staff manage children in church"
ON public.children
FOR ALL
USING (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- guardians
DROP POLICY IF EXISTS "Staff manage guardians in church" ON public.guardians;
CREATE POLICY "Staff manage guardians in church"
ON public.guardians
FOR ALL
USING (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- child_guardians (join)
DROP POLICY IF EXISTS "Staff manage child_guardians" ON public.child_guardians;
CREATE POLICY "Staff manage child_guardians"
ON public.child_guardians
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.children c
    WHERE c.id = child_id
      AND (c.church_id = public.current_church_id() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.children c
    WHERE c.id = child_id
      AND (c.church_id = public.current_church_id() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);

-- events
DROP POLICY IF EXISTS "Staff manage events in church" ON public.events;
CREATE POLICY "Staff manage events in church"
ON public.events
FOR ALL
USING (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- checkins
DROP POLICY IF EXISTS "Staff manage checkins in church" ON public.checkins;
CREATE POLICY "Staff manage checkins in church"
ON public.checkins
FOR ALL
USING (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- messages
DROP POLICY IF EXISTS "Staff manage messages in church" ON public.messages;
CREATE POLICY "Staff manage messages in church"
ON public.messages
FOR ALL
USING (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  (church_id = public.current_church_id() AND auth.uid() IS NOT NULL)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- leads
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
CREATE POLICY "Anyone can create leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view leads" ON public.leads;
CREATE POLICY "Admins can view leads"
ON public.leads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
