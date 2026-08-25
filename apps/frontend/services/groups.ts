import { http } from "./http"
import type { ApiResponse, City, Profile } from "./profile"

export type GroupRole = "OWNER" | "ADMIN" | "MEMBER"

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: GroupRole
  joinedAt: string
  user: {
    id: string
    profile: Profile | null
  }
}

export interface GroupCreator {
  id: string
  profile: Profile | null
}

export interface GroupListItem {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  cityId: string | null
  creatorId: string
  createdAt: string
  updatedAt: string
  city: City | null
  creator: {
    id: string
    profile: {
      firstName: string | null
      avatarUrl: string | null
    } | null
  } | null
  _count: { members: number }
}

export interface GroupDetail extends GroupListItem {
  creator: GroupCreator
  members: GroupMember[]
}

export interface CreateGroupInput {
  name: string
  description?: string
  imageUrl?: string
  cityId?: string
}

export interface UpdateGroupInput {
  name?: string
  description?: string
  imageUrl?: string
  cityId?: string
}

export function getGroups(params: {
  search?: string
  cityId?: string
  page?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set("search", params.search)
  if (params.cityId) searchParams.set("cityId", params.cityId)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  const qs = searchParams.toString()
  return http.get<ApiResponse<GroupListItem[]>>(
    `/groups${qs ? `?${qs}` : ""}`,
  )
}

export function getGroup(id: string) {
  return http.get<ApiResponse<GroupDetail>>(`/groups/${id}`)
}

export function createGroup(data: CreateGroupInput) {
  return http.post<ApiResponse<GroupDetail>>("/groups", data)
}

export function updateGroup(id: string, data: UpdateGroupInput) {
  return http.patch<ApiResponse<GroupDetail>>(`/groups/${id}`, data)
}

export function deleteGroup(id: string) {
  return http.delete<ApiResponse<null>>(`/groups/${id}`)
}

export function joinGroup(id: string) {
  return http.post<ApiResponse<GroupMember>>(`/groups/${id}/join`)
}

export function leaveGroup(id: string) {
  return http.delete<ApiResponse<null>>(`/groups/${id}/leave`)
}
