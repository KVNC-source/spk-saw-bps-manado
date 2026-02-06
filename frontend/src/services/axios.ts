import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("bps-auth");
  if (raw) {
    const { accessToken } = JSON.parse(raw);
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
