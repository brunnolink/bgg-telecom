import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { JSX } from "react";

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
