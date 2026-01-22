-- Kids ministry signups
CREATE TABLE IF NOT EXISTS public.kids_ministry_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  source_slug text NOT NULL DEFAULT 'ministerio-infantil',
  parent_name text NOT NULL,
  child_name text NOT NULL,
  child_age integer NULL,
  email text NULL,
  phone text NULL,
  message text NULL
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS kids_ministry_signups_created_at_idx
ON public.kids_ministry_signups (created_at DESC);

CREATE INDEX IF NOT EXISTS kids_ministry_signups_source_slug_idx
ON public.kids_ministry_signups (source_slug);

-- Enable RLS
ALTER TABLE public.kids_ministry_signups ENABLE ROW LEVEL SECURITY;

-- Policies: public insert, admin manage
DO $$ BEGIN
  CREATE POLICY "Anyone can create kids signups"
  ON public.kids_ministry_signups
  FOR INSERT
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view kids signups"
  ON public.kids_ministry_signups
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage kids signups"
  ON public.kids_ministry_signups
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete kids signups"
  ON public.kids_ministry_signups
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;