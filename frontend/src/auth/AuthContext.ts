import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  role: "ADMIN" | "MITRA";
  mitra_id: number | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;

  // 🔥 IMPORTANT: login now accepts token + user
  login: (data: { user: User; accessToken: string }) => void;

  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
