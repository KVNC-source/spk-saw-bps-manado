import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function RootRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <Navigate to="/dashboard/mitra" replace />;
}
