import { useEffect, useState, useCallback } from "react";
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

  const [user, setUser] = useState<AuthUser | null>(() => getInitialUser());

  /* =====================================================
     GLOBAL LOGOUT (FROM AXIOS)
  ===================================================== */

  useEffect(() => {
    const handler = () => {
      localStorage.removeItem("bps-auth");
      setUser(null);
      navigate("/login", { replace: true });
    };

    window.addEventListener("bps-logout", handler);

    return () => {
      window.removeEventListener("bps-logout", handler);
    };
  }, [navigate]);

  /* =====================================================
     SYNC BETWEEN TABS
  ===================================================== */

  useEffect(() => {
    const syncAuth = (event: StorageEvent) => {
      if (event.key === "bps-auth") {
        setUser(getInitialUser());
      }
    };

    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  /* =====================================================
     ACTIONS
  ===================================================== */

  const login = useCallback((payload: AuthPayload) => {
    localStorage.setItem("bps-auth", JSON.stringify(payload));
    setUser(payload.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bps-auth");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
