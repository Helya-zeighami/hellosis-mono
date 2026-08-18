import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getRecommendations,
  getPublicProfile,
  sendMatchRequest,
  getMatchRequests,
  acceptMatchRequest,
  rejectMatchRequest,
  queryKeys,
  HttpError,
  type ApiResponse,
  type Match,
  type MatchRequest,
  type PublicProfile,
  type Recommendation,
} from "@/services"

export function useRecommendations() {
  return useQuery<Recommendation[]>({
    queryKey: queryKeys.matches.recommendations,
    queryFn: () => getRecommendations().then((res) => res.data as Recommendation[]),
  })
}

export function usePublicProfile(profileId: string) {
  return useQuery<PublicProfile>({
    queryKey: queryKeys.profiles.detail(profileId),
    queryFn: () => getPublicProfile(profileId).then((res) => res.data as PublicProfile),
    enabled: profileId.length > 0,
  })
}

export function useSendMatchRequest() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Match>, HttpError, string>({
    mutationFn: (userId) => sendMatchRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.recommendations })
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.requests })
    },
  })
}

export function useMatchRequests() {
  return useQuery<MatchRequest[]>({
    queryKey: queryKeys.matches.requests,
    queryFn: () => getMatchRequests().then((res) => res.data as MatchRequest[]),
  })
}

export function useAcceptMatch() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Match>, HttpError, string>({
    mutationFn: (matchId) => acceptMatchRequest(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.requests })
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.recommendations })
    },
  })
}

export function useRejectMatch() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Match>, HttpError, string>({
    mutationFn: (matchId) => rejectMatchRequest(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.requests })
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.recommendations })
    },
  })
}
