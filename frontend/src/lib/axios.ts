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

const baseURL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, ""); // remove trailing slash

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
        // corrupted storage → clear it
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
      console.warn("401 Unauthorized from:", url);

      const raw = localStorage.getItem("bps-auth");
      if (!raw) return Promise.reject(error);

      /**
       * SAFE ENDPOINTS
       * These endpoints should NOT trigger auto logout
       */
      const SAFE_401: string[] = ["/auth/login"];

      const isSafe = SAFE_401.some((p) => url.includes(p));

      if (isSafe) {
        console.warn("Ignoring 401 for safe endpoint:", url);

        return Promise.resolve({
          data: null,
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config: error.config!,
        } as AxiosResponse);
      }

      // 🚨 Hard logout
      console.warn("Triggering global logout");

      localStorage.removeItem("bps-auth");
      window.dispatchEvent(new Event("bps-logout"));
    }

    return Promise.reject(error);
  },
);

export default api;
