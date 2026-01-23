-- Members table (church-scoped)
CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL DEFAULT public.current_church_id(),
  created_by uuid NOT NULL,

  first_name text NOT NULL,
  last_name text,
  phone text,
  email text,

  birth_date date,

  ministry text,
  participation text,
  status text NOT NULL DEFAULT 'active',

  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_members_church_id ON public.members(church_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_ministry ON public.members(ministry);
CREATE INDEX IF NOT EXISTS idx_members_birth_date ON public.members(birth_date);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Team can view members in their church; admins can view across
CREATE POLICY "Team can view members"
ON public.members
FOR SELECT
USING (
  (church_id = public.current_church_id() AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'leader'::public.app_role)
    OR public.has_role(auth.uid(), 'volunteer'::public.app_role)
  ))
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Team can create members in their church
CREATE POLICY "Team can create members"
ON public.members
FOR INSERT
WITH CHECK (
  church_id = public.current_church_id()
  AND created_by = auth.uid()
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'leader'::public.app_role)
    OR public.has_role(auth.uid(), 'volunteer'::public.app_role)
  )
);

-- Team can update members in their church
CREATE POLICY "Team can update members"
ON public.members
FOR UPDATE
USING (
  church_id = public.current_church_id()
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'leader'::public.app_role)
    OR public.has_role(auth.uid(), 'volunteer'::public.app_role)
  )
)
WITH CHECK (
  church_id = public.current_church_id()
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'leader'::public.app_role)
    OR public.has_role(auth.uid(), 'volunteer'::public.app_role)
  )
);

-- Admins can delete members; optionally allow leaders later
CREATE POLICY "Admins can delete members"
ON public.members
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_members_updated_at ON public.members;
CREATE TRIGGER trg_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Basic validation
CREATE OR REPLACE FUNCTION public.validate_member_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.first_name IS NULL OR btrim(NEW.first_name) = '' THEN
    RAISE EXCEPTION 'first_name is required';
  END IF;

  IF char_length(NEW.first_name) > 120 THEN
    RAISE EXCEPTION 'first_name too long';
  END IF;

  IF NEW.last_name IS NOT NULL AND char_length(NEW.last_name) > 120 THEN
    RAISE EXCEPTION 'last_name too long';
  END IF;

  IF NEW.email IS NOT NULL AND char_length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'email too long';
  END IF;

  IF NEW.phone IS NOT NULL AND char_length(NEW.phone) > 40 THEN
    RAISE EXCEPTION 'phone too long';
  END IF;

  IF NEW.status NOT IN ('active','inactive') THEN
    RAISE EXCEPTION 'invalid status %', NEW.status;
  END IF;

  IF NEW.ministry IS NOT NULL AND char_length(NEW.ministry) > 120 THEN
    RAISE EXCEPTION 'ministry too long';
  END IF;

  IF NEW.participation IS NOT NULL AND char_length(NEW.participation) > 40 THEN
    RAISE EXCEPTION 'participation too long';
  END IF;

  IF NEW.notes IS NOT NULL AND char_length(NEW.notes) > 2000 THEN
    RAISE EXCEPTION 'notes too long';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_member_fields ON public.members;
CREATE TRIGGER trg_validate_member_fields
BEFORE INSERT OR UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.validate_member_fields();
