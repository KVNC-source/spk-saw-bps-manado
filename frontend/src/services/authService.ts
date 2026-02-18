import api from "@/lib/axios";
import type { AuthUser, Role } from "@/auth/auth.types";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name: string; // 🔥 ADDED
    role: string;
    mitra_id?: number | null;
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
    name: user.name, // 🔥 NOW INCLUDED
    role: user.role.toUpperCase() as Role,
  };

  return {
    accessToken: token,
    user: mappedUser,
  };
}
