import { useMutation } from "@tanstack/react-query"

import {
  signup,
  login,
  logout,
  HttpError,
  type SignupResponse,
  type LoginResponse,
  type LogoutResponse,
} from "@/services"

export function useSignup() {
  return useMutation<SignupResponse, HttpError, string>({
    mutationFn: (phoneNumber) => signup(phoneNumber),
  })
}

export function useLogin() {
  return useMutation<
    LoginResponse,
    HttpError,
    { phoneNumber: string; otp?: string }
  >({
    mutationFn: ({ phoneNumber, otp }) => login(phoneNumber, otp),
  })
}

export function useLogout() {
  return useMutation<LogoutResponse, HttpError, string>({
    mutationFn: (refreshToken) => logout(refreshToken),
  })
}
