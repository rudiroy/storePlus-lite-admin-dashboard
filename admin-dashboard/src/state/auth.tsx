import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { email: string };

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LS_KEY = "admin_demo_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setUser(JSON.parse(raw));
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Demo validation (replace with API)
    if (!email.includes("@")) throw new Error("Please enter a valid email.");
    if (password.length < 4) throw new Error("Password must be at least 4 characters.");

    const u = { email };
    localStorage.setItem(LS_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(LS_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout, isLoading }), [user, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}