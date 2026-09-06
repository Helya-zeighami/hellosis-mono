import { useAuthStore } from "@/stores/auth-store"

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message)
    this.name = "HttpError"
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const accessToken = useAuthStore.getState().session?.accessToken
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  }
  if (accessToken) {
    ;(headers as Record<string, string>).Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = undefined
    }
    throw new HttpError(res.status, `Request failed with status ${res.status}`, body)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export const http = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
}
