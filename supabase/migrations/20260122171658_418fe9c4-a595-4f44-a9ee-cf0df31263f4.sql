-- Fix linter: avoid overly permissive lead INSERT policy

DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;

CREATE POLICY "Anyone can create leads (validated)"
ON public.leads
FOR INSERT
WITH CHECK (
  -- basic validation to avoid always-true policy
  name IS NOT NULL
  AND btrim(name) <> ''
  AND char_length(btrim(name)) <= 120
  AND (email IS NULL OR char_length(btrim(email)) <= 255)
  AND (phone IS NULL OR char_length(btrim(phone)) <= 40)
  AND (message IS NULL OR char_length(message) <= 2000)
  AND source IN ('site', 'public')
);
