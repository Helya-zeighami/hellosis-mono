import { http } from "./http"
import type { ApiResponse, City } from "./profile"
import type { EventCounts, EventCreator } from "./events"
import type { PlaceCategory, PlaceCreator } from "./places"

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"
export type UserRole = "USER" | "ADMIN"

export interface AdminEventListItem {
  id: string
  creatorId: string
  cityId: string
  title: string
  description: string
  startTime: string
  endTime: string | null
  approvalStatus: ApprovalStatus
  approvedAt: string | null
  createdAt: string
  city: City
  creator: EventCreator & { phoneNumber: string }
  approvedBy: { id: string; phoneNumber: string } | null
  _count: EventCounts
}

export interface AdminPlaceListItem {
  id: string
  name: string
  description: string | null
  cityId: string | null
  address: string | null
  categoryId: string | null
  imageUrl: string | null
  createdById: string | null
  approvalStatus: ApprovalStatus
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  city: City | null
  category: PlaceCategory | null
  createdBy: (PlaceCreator & { phoneNumber: string }) | null
  approvedBy: { id: string; phoneNumber: string } | null
}

export interface AdminUser {
  id: string
  phoneNumber: string
  role: UserRole
  isVerified: boolean
  createdAt: string
  profile: {
    firstName: string | null
    lastName: string | null
    avatarUrl: string | null
  } | null
}

export function getAdminEvents(params: {
  status?: ApprovalStatus
  page?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set("status", params.status)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  const qs = searchParams.toString()
  return http.get<ApiResponse<AdminEventListItem[]>>(
    `/admin/events${qs ? `?${qs}` : ""}`,
  )
}

export function approveEvent(id: string) {
  return http.patch<ApiResponse<AdminEventListItem>>(`/admin/events/${id}/approve`)
}

export function rejectEvent(id: string) {
  return http.patch<ApiResponse<AdminEventListItem>>(`/admin/events/${id}/reject`)
}

export function getAdminPlaces(params: {
  status?: ApprovalStatus
  page?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set("status", params.status)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  const qs = searchParams.toString()
  return http.get<ApiResponse<AdminPlaceListItem[]>>(
    `/admin/places${qs ? `?${qs}` : ""}`,
  )
}

export function approvePlace(id: string) {
  return http.patch<ApiResponse<AdminPlaceListItem>>(`/admin/places/${id}/approve`)
}

export function rejectPlace(id: string) {
  return http.patch<ApiResponse<AdminPlaceListItem>>(`/admin/places/${id}/reject`)
}

export function getAdminUsers(params: { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  const qs = searchParams.toString()
  return http.get<ApiResponse<AdminUser[]>>(
    `/admin/users${qs ? `?${qs}` : ""}`,
  )
}

export function updateUserRole(id: string, role: UserRole) {
  return http.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, { role })
}