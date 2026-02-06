import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { User } from "./AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: User["role"][];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
