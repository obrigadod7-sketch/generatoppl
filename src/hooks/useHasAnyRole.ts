import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "leader" | "volunteer" | "user";

async function hasAnyRole(roles: AppRole[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;
  if (!roles.length) return false;

  const checks = await Promise.all(
    roles.map(async (role) => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: role,
      });
      if (error) return false;
      return Boolean(data);
    }),
  );

  return checks.some(Boolean);
}

export function useHasAnyRole(roles: AppRole[]) {
  return useQuery({
    queryKey: ["auth", "hasAnyRole", roles.sort().join(",")],
    queryFn: () => hasAnyRole(roles),
    staleTime: 1000 * 30,
  });
}
