import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";

function getInitialUser(): User | null {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");

  if (!storedUser || !token) {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);

  const login = (data: { user: User; accessToken: string }) => {
    localStorage.setItem("access_token", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
