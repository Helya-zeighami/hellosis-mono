import { http } from "./http"

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  error: { code: string; details?: unknown } | null
}

export interface ProfileInterest {
  id: string
  name: string
}

export interface ProfileCity {
  id: string
  name: string
  country: string
}

export interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  birthDate: string | null
  bio: string | null
  avatarUrl: string | null
  city: ProfileCity | null
  interests: ProfileInterest[]
}

export interface Interest {
  id: string
  name: string
}

export interface City {
  id: string
  name: string
  country: string
}

export interface UpdateProfileInput {
  bio?: string
  avatarUrl?: string
  cityId?: string
}

export function getProfile() {
  return http.get<ApiResponse<Profile>>("/profile")
}

export function updateProfile(input: UpdateProfileInput) {
  return http.patch<ApiResponse<Profile>>("/profile", input)
}

export function getInterests() {
  return http.get<ApiResponse<Interest[]>>("/interests")
}

export function getCities() {
  return http.get<ApiResponse<City[]>>("/cities")
}

export function addProfileInterest(interestId: string) {
  return http.post<ApiResponse<ProfileInterest>>("/profile/interests", {
    interestId,
  })
}

export function removeProfileInterest(interestId: string) {
  return http.delete<ApiResponse<null>>(`/profile/interests/${interestId}`)
}
