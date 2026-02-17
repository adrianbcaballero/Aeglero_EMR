// frontend/lib/api.ts
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000"

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`GET ${path} failed: ${res.status} ${text}`)
  }

  return res.json() as Promise<T>
}

export function getHealth() {
  return apiGet<{ ok: boolean }>("/health")
}
