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
  return useMutation<SignupResponse, HttpError, { phoneNumber: string; firstName: string; lastName: string }>({
    mutationFn: ({ phoneNumber, firstName, lastName }) => signup(phoneNumber, firstName, lastName),
  })
}

export function useLogin() {
  return useMutation<
    LoginResponse,
    HttpError,
    { phoneNumber: string; otp?: string; firstName?: string; lastName?: string }
  >({
    mutationFn: ({ phoneNumber, otp, firstName, lastName }) => login(phoneNumber, otp, firstName, lastName),
  })
}

export function useLogout() {
  return useMutation<LogoutResponse, HttpError, string>({
    mutationFn: (refreshToken) => logout(refreshToken),
  })
}
