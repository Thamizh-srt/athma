import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authApi } from "@/api/authApi";
import { tokenStorage } from "@/utils/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStorage.getUser());

  // Expected Laravel response: { token: "...", user: {...} }
  const persist = useCallback(({ data }) => {
    tokenStorage.save(data.token, data.user);
    setUser(data.user);
  }, []);

  const login = useCallback(async (values) => persist(await authApi.login(values)), [persist]);
  const register = useCallback((values) => authApi.register(values), []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
