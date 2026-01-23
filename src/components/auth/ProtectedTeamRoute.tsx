import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useSession } from "@/hooks/useSession";
import { useHasAnyRole } from "@/hooks/useHasAnyRole";

export function ProtectedTeamRoute({ children }: { children: React.ReactNode }) {
  const { loading, userId } = useSession();
  const location = useLocation();
  const rolesQ = useHasAnyRole(["admin", "leader", "volunteer"]);

  if (loading || rolesQ.isLoading) return null;
  if (!userId) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!rolesQ.data) return <Navigate to="/" replace />;

  return <>{children}</>;
}
