import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getRecommendations,
  getPublicProfile,
  sendMatchRequest,
  getMatchRequests,
  getFriends,
  acceptMatchRequest,
  rejectMatchRequest,
  queryKeys,
  HttpError,
  type ApiResponse,
  type Friend,
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

export function useFriends() {
  return useQuery<Friend[]>({
    queryKey: queryKeys.matches.friends,
    queryFn: () => getFriends().then((res) => res.data as Friend[]),
  })
}

export function useAcceptMatch() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Match>, HttpError, string>({
    mutationFn: (matchId) => acceptMatchRequest(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.requests })
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.recommendations })
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.friends })
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
