import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, removeToken, saveToken } from "@/services/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types";

interface AuthUser {
  nome: string;
  email: string;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Pick<AuthUser, "nome">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUser(response: AuthResponse): AuthUser {
  const words = response.nome.trim().split(/\s+/);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
      : words[0].slice(0, 2).toUpperCase();
  return { nome: response.nome, email: response.email, initials };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    // Tenta restaurar sessão com o token existente
    fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:8080"}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("token inválido");
        return res.json() as Promise<AuthResponse>;
      })
      .then((data) => setUser(buildUser(data)))
      .catch(() => removeToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(data: LoginRequest): Promise<void> {
    const response = await api.auth.login(data);
    saveToken(response.token);
    setUser(buildUser(response));
  }

  async function register(data: RegisterRequest): Promise<void> {
    const response = await api.auth.register(data);
    saveToken(response.token);
    setUser(buildUser(response));
  }

  function logout(): void {
    removeToken();
    setUser(null);
  }

  function updateUser(data: Partial<Pick<AuthUser, "nome">>): void {
    setUser((prev) => {
      if (!prev) return null;
      const nome = data.nome ?? prev.nome;
      const words = nome.trim().split(/\s+/);
      const initials =
        words.length >= 2
          ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
          : words[0].slice(0, 2).toUpperCase();
      return { ...prev, nome, initials };
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
