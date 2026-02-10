import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import type { AuthUser, AuthPayload } from "./auth.types";

/* =========================================================
   HELPERS
========================================================= */

function getInitialUser(): AuthUser | null {
  const raw = localStorage.getItem("bps-auth");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthPayload;
    return parsed.user ?? null;
  } catch {
    localStorage.removeItem("bps-auth");
    return null;
  }
}

/* =========================================================
   PROVIDER
========================================================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // ✅ single source of truth
  const [user, setUser] = useState<AuthUser | null>(() => getInitialUser());

  /* =====================================================
     AXIOS LOGOUT LISTENER
  ===================================================== */

  useEffect(() => {
    const handler = () => {
      localStorage.removeItem("bps-auth");
      setUser(null);
      navigate("/login", { replace: true });
    };

    window.addEventListener("bps-logout", handler);
    return () => window.removeEventListener("bps-logout", handler);
  }, [navigate]);

  /* =====================================================
     ACTIONS
  ===================================================== */

  const login = (payload: AuthPayload) => {
    localStorage.setItem("bps-auth", JSON.stringify(payload));
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem("bps-auth");
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
