import api from "@/lib/axios";
import type { AuthUser, Role } from "@/auth/auth.types";

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
): Promise<{ accessToken: string; user: AuthUser }> {
  const res = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });

  const { token, user } = res.data;

  const mappedUser: AuthUser = {
    id: user.id,
    username: user.username,
    role: user.role.toUpperCase() as Role,
  };

  return {
    accessToken: token, // 🔥 THIS IS THE FIX
    user: mappedUser,
  };
}
