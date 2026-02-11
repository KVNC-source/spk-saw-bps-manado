export type Role = "ADMIN" | "MITRA" | "KETUA_TIM";

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (payload: AuthPayload) => void;
  logout: () => void;
}
