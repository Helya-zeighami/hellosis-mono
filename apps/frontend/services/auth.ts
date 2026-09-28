import { http } from "./http"

export interface SignupResponse {
  success: boolean
  message: string
  data: SignupData | null
  error: { code: string; details?: unknown } | null
}

export interface SignupData {
  expiresAt: string
  developmentOtp?: string
}

export function signup(phoneNumber: string, firstName: string, lastName: string) {
  return http.post<SignupResponse>("/auth/signup", { phoneNumber, firstName, lastName })
}

export interface LoginResponse {
  success: boolean
  message: string
  data: LoginData | null
  error: { code: string; details?: unknown } | null
}

export interface LoginData {
  user?: { id: string; phoneNumber: string; role: "USER" | "ADMIN" }
  accessToken?: string
  refreshToken?: string
  developmentOtp?: string
  isNewUser?: boolean
}

export function login(phoneNumber: string, otp?: string, firstName?: string, lastName?: string) {
  return http.post<LoginResponse>("/auth/login", { phoneNumber, otp, firstName, lastName })
}

export interface RefreshResponse {
  success: boolean
  message: string
  data: LoginData | null
  error: { code: string; details?: unknown } | null
}

export function refresh(refreshToken: string) {
  return http.post<RefreshResponse>("/auth/refresh", { refreshToken })
}

export interface LogoutResponse {
  success: boolean
  message: string
  data: null
  error: { code: string; details?: unknown } | null
}

export function logout(refreshToken: string) {
  return http.post<LogoutResponse>("/auth/logout", { refreshToken })
}
