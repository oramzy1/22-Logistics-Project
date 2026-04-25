import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, setToken, clearToken } from './api';

interface AdminUser { id: string; name: string; email: string; role: string; }
interface AuthCtx {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from token — decode payload (no extra request needed)
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.id, name: payload.name ?? 'Admin', email: payload.email ?? '', role: payload.role });
        } else {
          clearToken();
        }
      } catch {
        clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
    const res = await fetch(`${BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Login failed');
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    window.location.href = '/login';
  };

  return <Ctx.Provider value={{ user, login, logout, isLoading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);