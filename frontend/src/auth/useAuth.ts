import { useContext } from "react";
import axios from "../lib/axios";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { login: setAuth, logout, user, loading } = context;

  // 🔍 DEBUG (temporary)
  console.log("USE_AUTH STATE", {
    user,
    loading,
    token: localStorage.getItem("access_token"),
  });

  const login = async (username: string, password: string) => {
    const res = await axios.post("/auth/login", {
      username,
      password,
    });

    const data: { accessToken: string; user: User } = res.data;

    setAuth({
      user: data.user,
      accessToken: data.accessToken,
    });

    return data;
  };

  return {
    user,
    loading,
    login,
    logout,
  };
}
