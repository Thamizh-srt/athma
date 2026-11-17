import axios from "axios";
import { adminTokenStorage, tokenStorage } from "@/utils/tokenStorage";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

const isAdminUrl = (url = "") => url.startsWith("/admin");

client.interceptors.request.use((config) => {
  const store = isAdminUrl(config.url) ? adminTokenStorage : tokenStorage;
  const token = store.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthCall = url.startsWith("/auth/") || url.startsWith("/admin/auth/");
    if (error.response?.status === 401 && !isAuthCall) {
      const admin = isAdminUrl(url);
      (admin ? adminTokenStorage : tokenStorage).clear();
      window.location.assign(admin ? "/admin/login" : "/login");
    }
    return Promise.reject(error);
  }
);

export default client;
