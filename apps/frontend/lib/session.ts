export const SESSION_COOKIE = "hellosis_session"

export interface SessionUser {
  id: string
  phoneNumber: string
  role?: "USER" | "ADMIN"
}

export interface Session {
  accessToken: string
  refreshToken: string
  user: SessionUser
}

const MAX_AGE = 30 * 24 * 60 * 60

export function getSession(): Session | null {
  if (typeof document === "undefined") return null

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SESSION_COOKIE}=`))

  if (!cookie) return null

  try {
    return JSON.parse(decodeURIComponent(cookie.split("=").slice(1).join("="))) as Session
  } catch {
    return null
  }
}

export function setSession(session: Session) {
  const value = encodeURIComponent(JSON.stringify(session))
  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax`
}

export function clearSession() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}