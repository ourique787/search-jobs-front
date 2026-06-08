import type { AuthResponse, Job, LoginRequest, RegisterRequest, RelatorioDTO, Senioridade, Stack } from "@/types";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";

const TOKEN_KEY = "sj_token";

function redirectToLogin(): void {
  removeToken();
  window.location.href = "/";
}

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
    if (res.status === 401) {
      if (getToken()) {
        // Token existe mas expirou — força re-login
        redirectToLogin();
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      // Sem token (ex: credenciais erradas no login) — propaga o erro normalmente
      throw new Error("Erro 401");
    }
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
    click: (id: number): Promise<void> =>
      request<void>(`/api/jobs/${id}/click`, { method: "POST" }),
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

  users: {
    updateProfile: (data: { nome?: string }): Promise<AuthResponse> =>
      request<AuthResponse>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    updatePassword: (data: { senhaAtual: string; novaSenha: string }): Promise<void> =>
      request<void>("/api/users/me/senha", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  relatorio: {
    gerar: (params: {
      dataInicio?: string;
      dataFim?: string;
      stackIds?: number[];
      senioridades?: Senioridade[];
    }): Promise<RelatorioDTO> => {
      const searchParams = new URLSearchParams();
      if (params.dataInicio) searchParams.set("dataInicio", params.dataInicio);
      if (params.dataFim) searchParams.set("dataFim", params.dataFim);
      if (params.stackIds?.length) searchParams.set("stackIds", params.stackIds.join(","));
      if (params.senioridades?.length) searchParams.set("senioridades", params.senioridades.join(","));
      const query = searchParams.toString();
      return request<RelatorioDTO>(`/api/relatorio${query ? "?" + query : ""}`);
    },
  },
};
