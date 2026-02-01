-- Tighten SELECT policies to explicitly require authenticated sessions

-- PROFILES: ensure SELECT always requires auth.uid() not null
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- GUARDIANS: ensure ALL access requires an authenticated user, including admin branch
DROP POLICY IF EXISTS "Staff manage guardians in church" ON public.guardians;
CREATE POLICY "Staff manage guardians in church"
ON public.guardians
FOR ALL
USING (
  auth.uid() IS NOT NULL
  AND (
    church_id = current_church_id()
    OR has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    church_id = current_church_id()
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);
