import { http } from "./http"
import type { ApiResponse, Profile, ProfileInterest, ProfileCity } from "./profile"

export type MatchStatus = "PENDING" | "ACCEPTED" | "REJECTED"

export type MatchRelationship =
  | "SENT"
  | "RECEIVED"
  | "ACCEPTED"
  | "REJECTED"
  | null

export interface Recommendation {
  id: string
  userId: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  avatarUrl: string | null
  city: Pick<ProfileCity, "id" | "name"> | null
  interests: ProfileInterest[]
  sharedInterests: ProfileInterest[]
  sameCity: boolean
  compatibility: number
}

export interface PublicProfile extends Profile {
  userId: string
  sharedInterests: ProfileInterest[]
  sameCity: boolean
  compatibility: number
  matchId: string | null
  matchStatus: MatchRelationship
}

export interface Match {
  id: string
  status: MatchStatus
}

export interface MatchRequest {
  id: string
  status: MatchStatus
  createdAt: string
  sender: Recommendation
}

export function getRecommendations() {
  return http.get<ApiResponse<Recommendation[]>>("/matches/recommendations")
}

export function getPublicProfile(profileId: string) {
  return http.get<ApiResponse<PublicProfile>>(`/profile/${profileId}`)
}

export function sendMatchRequest(userId: string) {
  return http.post<ApiResponse<Match>>(`/matches/${userId}`)
}

export function getMatchRequests() {
  return http.get<ApiResponse<MatchRequest[]>>("/matches/requests")
}

export function acceptMatchRequest(matchId: string) {
  return http.patch<ApiResponse<Match>>(`/matches/${matchId}/accept`)
}

export function rejectMatchRequest(matchId: string) {
  return http.patch<ApiResponse<Match>>(`/matches/${matchId}/reject`)
}
