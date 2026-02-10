export type Role = "ADMIN" | "MITRA";

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

  // Context login ONLY accepts payload
  login: (payload: AuthPayload) => void;

  logout: () => void;
}
