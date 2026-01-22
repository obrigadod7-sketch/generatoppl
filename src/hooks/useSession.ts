import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SessionState = {
  loading: boolean;
  userId: string | null;
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ loading: true, userId: null });

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ loading: false, userId: session?.user?.id ?? null });
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setState({ loading: false, userId: data.session?.user?.id ?? null });
      })
      .catch(() => {
        if (!mounted) return;
        setState({ loading: false, userId: null });
      });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
