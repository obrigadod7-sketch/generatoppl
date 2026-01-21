-- Roles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- Ministries (public content)
CREATE TABLE IF NOT EXISTS public.ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separate table)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Cache of external image URLs (NO binaries, only URLs)
CREATE TABLE IF NOT EXISTS public.ministry_image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ministry_id)
);

-- RLS
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_image_cache ENABLE ROW LEVEL SECURITY;

-- Helper: updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
DROP TRIGGER IF EXISTS update_ministries_updated_at ON public.ministries;
CREATE TRIGGER update_ministries_updated_at
BEFORE UPDATE ON public.ministries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ministry_image_cache_updated_at ON public.ministry_image_cache;
CREATE TRIGGER update_ministry_image_cache_updated_at
BEFORE UPDATE ON public.ministry_image_cache
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Policies: ministries are public readable, admin write
DROP POLICY IF EXISTS "Ministries are viewable by everyone" ON public.ministries;
CREATE POLICY "Ministries are viewable by everyone"
ON public.ministries
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage ministries" ON public.ministries;
CREATE POLICY "Admins manage ministries"
ON public.ministries
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies: user_roles only admins
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies: image cache viewable by everyone, admin write
DROP POLICY IF EXISTS "Image cache viewable by everyone" ON public.ministry_image_cache;
CREATE POLICY "Image cache viewable by everyone"
ON public.ministry_image_cache
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage image cache" ON public.ministry_image_cache;
CREATE POLICY "Admins manage image cache"
ON public.ministry_image_cache
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
