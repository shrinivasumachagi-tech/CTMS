"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name: string;
  mobile?: string;
  department_id?: string;
  department?: string;
  user_metadata?: Record<string, unknown>;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PUBLIC_ROUTES = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/callback", "/auth/reset-password"];

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      setUser(data || null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (loading) return;
    if (!user && !PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      router.replace("/auth/login");
    }
  }, [loading, user, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
