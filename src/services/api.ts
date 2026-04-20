import type { AuthResponse, Job, LoginRequest, RegisterRequest, Stack } from "@/types";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";

const TOKEN_KEY = "sj_token";

export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> | undefined) },
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (data: LoginRequest): Promise<AuthResponse> =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    register: (data: RegisterRequest): Promise<AuthResponse> =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  jobs: {
    list: (): Promise<Job[]> => request<Job[]>("/api/jobs"),
  },

  stacks: {
    list: (): Promise<Stack[]> => request<Stack[]>("/api/stacks"),
  },

  applications: {
    create: (vagaId: number): Promise<void> =>
      request<void>("/api/applications", {
        method: "POST",
        body: JSON.stringify({ vagaId }),
      }),
  },
};
