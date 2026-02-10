import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { loginService } from "@/services/authService";
import type { AuthUser } from "./auth.types";

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  const { user, login: storeAuth, logout } = ctx;

  const login = async (
    username: string,
    password: string,
  ): Promise<{ user: AuthUser }> => {
    const { accessToken, user } = await loginService(username, password);

    // 🔍 ADD THIS LINE
    console.log("LOGIN PAYLOAD FROM SERVICE:", { accessToken, user });

    storeAuth({
      accessToken,
      user,
    });

    return { user };
  };

  return {
    user,
    login,
    logout,
  };
}
