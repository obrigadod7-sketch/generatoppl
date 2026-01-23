-- Assistant conversations
CREATE TABLE IF NOT EXISTS public.assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL DEFAULT public.current_church_id(),
  created_by uuid NOT NULL,
  title text NOT NULL DEFAULT 'Conversa',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Assistant messages
CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.assistant_conversations(id) ON DELETE CASCADE,
  church_id uuid NOT NULL DEFAULT public.current_church_id(),
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_church_created_at
  ON public.assistant_conversations (church_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assistant_messages_conversation_created_at
  ON public.assistant_messages (conversation_id, created_at ASC);

-- Enable RLS
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

-- Helper: team role predicate used inline in policies
-- (admin, leader, volunteer)

-- Conversations policies
DROP POLICY IF EXISTS "Team can view assistant conversations" ON public.assistant_conversations;
CREATE POLICY "Team can view assistant conversations"
ON public.assistant_conversations
FOR SELECT
USING (
  (church_id = public.current_church_id()) AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'leader'::public.app_role)
    OR public.has_role(auth.uid(), 'volunteer'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Team can create assistant conversations" ON public.assistant_conversations;
CREATE POLICY "Team can create assistant conversations"
ON public.assistant_conversations
FOR INSERT
WITH CHECK (
  (church_id = public.current_church_id())
  AND (created_by = auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'leader'::public.app_role)
    OR public.has_role(auth.uid(), 'volunteer'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Owners or admins can update assistant conversations" ON public.assistant_conversations;
CREATE POLICY "Owners or admins can update assistant conversations"
ON public.assistant_conversations
FOR UPDATE
USING (
  (church_id = public.current_church_id())
  AND (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
)
WITH CHECK (
  (church_id = public.current_church_id())
  AND (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Owners or admins can delete assistant conversations" ON public.assistant_conversations;
CREATE POLICY "Owners or admins can delete assistant conversations"
ON public.assistant_conversations
FOR DELETE
USING (
  (church_id = public.current_church_id())
  AND (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Messages policies
DROP POLICY IF EXISTS "Team can view assistant messages" ON public.assistant_messages;
CREATE POLICY "Team can view assistant messages"
ON public.assistant_messages
FOR SELECT
USING (
  (church_id = public.current_church_id()) AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'leader'::public.app_role)
    OR public.has_role(auth.uid(), 'volunteer'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Team can create assistant messages" ON public.assistant_messages;
CREATE POLICY "Team can create assistant messages"
ON public.assistant_messages
FOR INSERT
WITH CHECK (
  (church_id = public.current_church_id())
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'leader'::public.app_role)
    OR public.has_role(auth.uid(), 'volunteer'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Admins can delete assistant messages" ON public.assistant_messages;
CREATE POLICY "Admins can delete assistant messages"
ON public.assistant_messages
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- updated_at trigger
DROP TRIGGER IF EXISTS update_assistant_conversations_updated_at ON public.assistant_conversations;
CREATE TRIGGER update_assistant_conversations_updated_at
BEFORE UPDATE ON public.assistant_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Validation trigger for message role
CREATE OR REPLACE FUNCTION public.validate_assistant_message_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role NOT IN ('system', 'user', 'assistant') THEN
    RAISE EXCEPTION 'Invalid role %', NEW.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_assistant_message_role ON public.assistant_messages;
CREATE TRIGGER validate_assistant_message_role
BEFORE INSERT OR UPDATE ON public.assistant_messages
FOR EACH ROW
EXECUTE FUNCTION public.validate_assistant_message_role();
