import axios from "axios";
import type {
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from "axios";

/* =========================================================
   TYPES
========================================================= */

type AuthStorage = {
  accessToken: string;
  user: {
    id: string;
    role: string;
  };
};

/* =========================================================
   AXIOS INSTANCE
========================================================= */

// 🔥 IMPORTANT: include /api because backend uses global prefix
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
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
        const parsed = JSON.parse(raw) as AuthStorage;

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
  (res: AxiosResponse) => res,

  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    if (status === 401) {
      const SAFE_401: string[] = ["/auth/login"];

      const isSafe = SAFE_401.some((p) => url.includes(p));

      if (!isSafe) {
        localStorage.removeItem("bps-auth");
        window.dispatchEvent(new Event("bps-logout"));
      }
    }

    return Promise.reject(error);
  },
);

export default api;
