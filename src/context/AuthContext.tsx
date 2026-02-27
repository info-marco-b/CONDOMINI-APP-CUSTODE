import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSession, setSession, clearSession } from "@/lib/session";

interface AuthContextValue {
  session: unknown;
  isAuthenticated: boolean;
  isReady: boolean;
  setAuthSession: (data: unknown) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<unknown>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSessionState(getSession());
    setIsReady(true);
  }, []);

  const setAuthSession = useCallback((data: unknown) => {
    setSession(data);
    setSessionState(data);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      isReady,
      setAuthSession,
      logout,
    }),
    [session, isReady, setAuthSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook export
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
