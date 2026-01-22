-- Tighten permissive INSERT policies flagged by linter

-- kids_ministry_signups: ensure inserts are only for its slug
DROP POLICY IF EXISTS "Anyone can create kids signups" ON public.kids_ministry_signups;
CREATE POLICY "Anyone can create kids signups"
ON public.kids_ministry_signups
FOR INSERT
WITH CHECK (source_slug = 'ministerio-infantil');

-- couple_ministry_signups: ensure inserts are only for its slug
DROP POLICY IF EXISTS "Anyone can create signups" ON public.couple_ministry_signups;
CREATE POLICY "Anyone can create signups"
ON public.couple_ministry_signups
FOR INSERT
WITH CHECK (source_slug = 'ministerio-de-casais');