import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

async function getIsAdmin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (error) return false;
  return Boolean(data);
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ["auth", "isAdmin"],
    queryFn: getIsAdmin,
    staleTime: 1000 * 60,
  });
}
