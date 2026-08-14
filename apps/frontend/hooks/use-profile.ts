import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getProfile,
  updateProfile,
  getInterests,
  getCities,
  addProfileInterest,
  removeProfileInterest,
  queryKeys,
  HttpError,
  type Profile,
  type ProfileInterest,
  type Interest,
  type City,
  type UpdateProfileInput,
  type ApiResponse,
} from "@/services"

export function useProfile() {
  return useQuery<Profile>({
    queryKey: queryKeys.profiles.me,
    queryFn: () => getProfile().then((res) => res.data as Profile),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Profile>, HttpError, UpdateProfileInput>({
    mutationFn: (input) => updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me })
    },
  })
}

export function useInterests() {
  return useQuery<Interest[]>({
    queryKey: queryKeys.interests.all,
    queryFn: () => getInterests().then((res) => res.data as Interest[]),
  })
}

export function useCities() {
  return useQuery<City[]>({
    queryKey: queryKeys.cities.all,
    queryFn: () => getCities().then((res) => res.data as City[]),
  })
}

export function useAddProfileInterest() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<ProfileInterest>, HttpError, string>({
    mutationFn: (interestId) => addProfileInterest(interestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me })
    },
  })
}

export function useRemoveProfileInterest() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<null>, HttpError, string>({
    mutationFn: (interestId) => removeProfileInterest(interestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me })
    },
  })
}
