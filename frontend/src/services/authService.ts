import type { AuthUser } from "../auth/auth.types";

interface LoginPayload {
  email: string;
  password: string;
}

export async function loginService(payload: LoginPayload): Promise<AuthUser> {
  // simulate backend delay
  await new Promise((res) => setTimeout(res, 800));

  if (payload.email === "admin@bast.com" && payload.password === "admin") {
    return { email: payload.email, role: "ADMIN" };
  }

  if (payload.email === "mitra@bast.com" && payload.password === "mitra") {
    return { email: payload.email, role: "MITRA" };
  }

  throw new Error("Invalid email or password");
}
