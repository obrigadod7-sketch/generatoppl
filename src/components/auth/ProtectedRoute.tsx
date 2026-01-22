import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, userId } = useSession();
  const location = useLocation();

  if (loading) return null;
  if (!userId) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
