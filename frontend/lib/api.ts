// frontend/lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

let sessionToken: string | null = null;

export function setSessionToken(token: string | null) {
  sessionToken = token;
}

export function getSessionToken(): string | null {
  return sessionToken;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `GET ${path} failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, data?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `POST ${path} failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function getHealth() {
  return apiGet<{ ok: boolean }>("/health");
}

// Auth API calls
export interface LoginResponse {
  user_id: number;
  username: string;
  role: "psychiatrist" | "technician" | "admin";
  session_id: string;
}

export function login(username: string, password: string) {
  return apiPost<LoginResponse>("/api/auth/login", { username, password });
}

export function logout() {
  return apiPost<{ ok: boolean }>("/api/auth/logout");
}

export function getMe() {
  return apiGet<{ user_id: number; username: string; role: string }>("/api/auth/me");
}