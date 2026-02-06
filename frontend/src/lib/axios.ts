import axios, { AxiosHeaders } from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers = AxiosHeaders.from({
      ...config.headers,
      Authorization: `Bearer ${token}`,
    });
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default instance;
