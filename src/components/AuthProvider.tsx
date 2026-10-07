"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_EXPIRED_EVENT,
  api,
  getToken,
  setToken,
  type MeResponse,
  type SafeUser,
} from "@/lib/api";

type AuthContextValue = {
  user: SafeUser | null;
  loading: boolean;
  /** Stores the token and verifies the session with the server. */
  login: (user: SafeUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<SafeUser | null>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refresh: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const d = await api<MeResponse>("/api/auth/me");
      setUser(d.user);
      if (!d.user && getToken()) setToken(null);
      return d.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // Drop stale "logged in" state whenever any API call reports 401.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (u: SafeUser, token: string) => {
    setToken(token);
    // Confirm the server recognises the token before we trust it.
    const d = await api<MeResponse>("/api/auth/me");
    if (!d.user) {
      setToken(null);
      const t = d.transports;
      const detail = t
        ? ` (server saw — auth header: ${t.authorization ? "yes" : "no"}, ` +
          `custom header: ${t.header ? "yes" : "no"}, ` +
          `query: ${t.query ? "yes" : "no"}, cookie: ${t.cookie ? "yes" : "no"})`
        : "";
      throw new Error(
        "Signed in, but the session could not be established. Please try again." +
          detail
      );
    }
    setUser(d.user ?? u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore – we clear local state regardless */
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
