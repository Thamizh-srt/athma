import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { adminTokenStorage } from "@/utils/tokenStorage";

const Ctx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => adminTokenStorage.getUser());

  const login = useCallback(async (credentials) => {
    const data = await adminApi.login(credentials);
    adminTokenStorage.save(data.token, data.admin);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } catch {

    } finally {
      adminTokenStorage.clear();
      setAdmin(null);
    }
  }, []);

  const value = useMemo(() => ({ admin, login, logout }), [admin, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAdminAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return ctx;
};
