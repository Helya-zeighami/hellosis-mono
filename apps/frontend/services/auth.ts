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

export function signup(phoneNumber: string) {
  return http.post<SignupResponse>("/auth/signup", { phoneNumber })
}

export interface LoginResponse {
  success: boolean
  message: string
  data: LoginData | null
  error: { code: string; details?: unknown } | null
}

export interface LoginData {
  user?: { id: string; phoneNumber: string }
  accessToken?: string
  refreshToken?: string
  developmentOtp?: string
}

export function login(phoneNumber: string, otp?: string) {
  return http.post<LoginResponse>("/auth/login", { phoneNumber, otp })
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
