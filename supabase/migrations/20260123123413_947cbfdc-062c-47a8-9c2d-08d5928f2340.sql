BEGIN;

-- Allow any authenticated user to view monthly finance totals for their own church.
DROP POLICY IF EXISTS "Team can view finance_monthly" ON public.finance_monthly;

CREATE POLICY "Authenticated users can view finance_monthly"
ON public.finance_monthly
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND church_id = public.current_church_id()
);

COMMIT;