import api from "@/lib/axios";

import type { AuthUser, Role } from "../auth/auth.types";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export async function loginService(
  username: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  const res = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });

  const { token, user } = res.data;

  // 🚫 DO NOT ADD EMAIL HERE
  const mappedUser: AuthUser = {
    id: user.id,
    username: user.username,
    role: user.role.toUpperCase() as Role, // ✅ FIX
  };

  return {
    token,
    user: mappedUser,
  };
}
