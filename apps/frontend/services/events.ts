import { http } from "./http"
import type { ApiResponse, City } from "./profile"

export interface EventCreator {
  id: string
  profile: {
    firstName: string | null
    lastName: string | null
    avatarUrl: string | null
  } | null
}

export interface EventCounts {
  likes: number
  dislikes: number
  comments: number
}

export interface EventListItem {
  id: string
  creatorId: string
  cityId: string
  title: string
  description: string
  startTime: string
  endTime: string | null
  createdAt: string
  city: City
  creator: EventCreator
  _count: EventCounts
}

export interface EventComment {
  id: string
  eventId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    profile: {
      firstName: string | null
      lastName: string | null
      avatarUrl: string | null
    } | null
  }
}

export interface EventDetail extends EventListItem {
  comments: EventComment[]
}

export interface EventReaction {
  liked: boolean
  disliked: boolean
}

export interface CreateEventInput {
  title: string
  description: string
  cityId: string
  startTime: string
  endTime?: string
}

export interface UpdateEventInput {
  title?: string
  description?: string
  cityId?: string
  startTime?: string
  endTime?: string
}

export function getEvents(params: {
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
  return http.get<ApiResponse<EventListItem[]>>(
    `/events${qs ? `?${qs}` : ""}`,
  )
}

export function getEvent(id: string) {
  return http.get<ApiResponse<EventDetail>>(`/events/${id}`)
}

export function createEvent(data: CreateEventInput) {
  return http.post<ApiResponse<EventDetail>>("/events", data)
}

export function updateEvent(id: string, data: UpdateEventInput) {
  return http.patch<ApiResponse<EventDetail>>(`/events/${id}`, data)
}

export function deleteEvent(id: string) {
  return http.delete<ApiResponse<null>>(`/events/${id}`)
}

export function toggleLike(id: string) {
  return http.post<ApiResponse<EventReaction>>(`/events/${id}/like`)
}

export function toggleDislike(id: string) {
  return http.post<ApiResponse<EventReaction>>(`/events/${id}/dislike`)
}

export function getEventComments(id: string) {
  return http.get<ApiResponse<EventComment[]>>(`/events/${id}/comments`)
}

export function createEventComment(id: string, content: string) {
  return http.post<ApiResponse<EventComment>>(`/events/${id}/comments`, {
    content,
  })
}

export function deleteEventComment(eventId: string, commentId: string) {
  return http.delete<ApiResponse<null>>(
    `/events/${eventId}/comments/${commentId}`,
  )
}
