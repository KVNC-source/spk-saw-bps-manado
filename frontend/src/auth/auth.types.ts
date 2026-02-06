export type Role = "ADMIN" | "MITRA";

export interface AuthUser {
  id: string; // ✅ FIXED (UUID)
  username: string;
  role: Role;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
