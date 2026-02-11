import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function RootRedirect() {
  const { user } = useAuth();

  const roleRedirect: Record<string, string> = {
    ADMIN: "/admin/dashboard",
    MITRA: "/mitra/dashboard",
    KETUA_TIM: "/ketua/dashboard",
  };

  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={roleRedirect[user.role] ?? "/login"} replace />;
}
