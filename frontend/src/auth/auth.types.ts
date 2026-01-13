export type Role = "ADMIN" | "MITRA";

export interface AuthUser {
  email: string;
  role: Role;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
