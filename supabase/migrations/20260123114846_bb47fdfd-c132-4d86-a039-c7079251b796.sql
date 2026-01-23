-- Finance totals by month (simple)
CREATE TABLE IF NOT EXISTS public.finance_monthly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL DEFAULT public.current_church_id(),
  created_by uuid NOT NULL,

  month date NOT NULL, -- store the 1st day of the month

  tithes numeric NOT NULL DEFAULT 0,
  offerings numeric NOT NULL DEFAULT 0,
  donations numeric NOT NULL DEFAULT 0,
  expenses numeric NOT NULL DEFAULT 0,

  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (church_id, month)
);

CREATE INDEX IF NOT EXISTS idx_finance_monthly_church_month ON public.finance_monthly(church_id, month);

ALTER TABLE public.finance_monthly ENABLE ROW LEVEL SECURITY;

-- Team can view finance totals in their church; admins can view across
CREATE POLICY "Team can view finance_monthly"
ON public.finance_monthly
FOR SELECT
USING (
  (church_id = public.current_church_id() AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'leader'::public.app_role)
    OR public.has_role(auth.uid(), 'volunteer'::public.app_role)
  ))
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Team can create finance totals
CREATE POLICY "Team can create finance_monthly"
ON public.finance_monthly
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

-- Team can update finance totals
CREATE POLICY "Team can update finance_monthly"
ON public.finance_monthly
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

-- Admins can delete (optional)
CREATE POLICY "Admins can delete finance_monthly"
ON public.finance_monthly
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_finance_monthly_updated_at ON public.finance_monthly;
CREATE TRIGGER trg_finance_monthly_updated_at
BEFORE UPDATE ON public.finance_monthly
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Validation: non-negative values
CREATE OR REPLACE FUNCTION public.validate_finance_monthly_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.month IS NULL THEN
    RAISE EXCEPTION 'month is required';
  END IF;

  IF NEW.tithes < 0 OR NEW.offerings < 0 OR NEW.donations < 0 OR NEW.expenses < 0 THEN
    RAISE EXCEPTION 'finance values must be non-negative';
  END IF;

  IF NEW.notes IS NOT NULL AND char_length(NEW.notes) > 2000 THEN
    RAISE EXCEPTION 'notes too long';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_finance_monthly_fields ON public.finance_monthly;
CREATE TRIGGER trg_validate_finance_monthly_fields
BEFORE INSERT OR UPDATE ON public.finance_monthly
FOR EACH ROW
EXECUTE FUNCTION public.validate_finance_monthly_fields();
