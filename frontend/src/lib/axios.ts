import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

/* =========================================================
   AXIOS INSTANCE
========================================================= */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const raw = localStorage.getItem("bps-auth");

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken) {
          config.headers.Authorization = `Bearer ${parsed.accessToken}`;
        }
      } catch {
        localStorage.removeItem("bps-auth");
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    if (status === 401) {
      console.warn("401 from:", url);

      const raw = localStorage.getItem("bps-auth");
      if (!raw) return Promise.reject(error);

      // 🔒 safe endpoints NEVER logout
      const SAFE_401 = ["/dashboard-summary", "/spk", "/saw", "/mitra"];

      const isSafe = SAFE_401.some((p) => url.includes(p));
      if (isSafe) {
        console.warn("Ignoring 401 for:", url);
        return Promise.reject(error);
      }

      // 🚨 emit logout event instead
      window.dispatchEvent(new Event("bps-logout"));
    }

    return Promise.reject(error);
  },
);

export default api;
