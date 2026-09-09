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

let refreshPromise: Promise<boolean> | null = null

async function attemptRefresh(): Promise<boolean> {
  const store = useAuthStore.getState()
  const refreshToken = store.session?.refreshToken

  if (!refreshToken) return false

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) {
      store.clearSession()
      return false
    }

    const json = (await res.json()) as {
      data?: {
        accessToken?: string
        refreshToken?: string
        user?: { id: string; phoneNumber: string; role?: "USER" | "ADMIN" }
      }
    }

    const data = json.data
    const previous = store.session

    if (!data?.accessToken || !data.refreshToken || !previous) {
      store.clearSession()
      return false
    }

    store.updateSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        id: data.user?.id ?? previous.user.id,
        phoneNumber: data.user?.phoneNumber ?? previous.user.phoneNumber,
        role: data.user?.role ?? previous.user.role,
      },
    })

    return true
  } catch {
    useAuthStore.getState().clearSession()
    return false
  }
}

async function refreshWithMutex(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = attemptRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
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

    const shouldRefresh =
      res.status === 401 &&
      !path.startsWith("/auth/refresh") &&
      !path.startsWith("/auth/login") &&
      !(options as { __retried?: boolean } | undefined)?.__retried

    if (shouldRefresh) {
      const refreshed = await refreshWithMutex()
      if (refreshed) {
        return apiFetch<T>(path, {
          ...options,
          __retried: true,
        } as RequestInit)
      }
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