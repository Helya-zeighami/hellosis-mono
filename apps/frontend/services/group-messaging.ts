import { http } from "./http"
import type { ApiResponse } from "./profile"
import type { UserSummary } from "./messaging"

export interface GroupMessage {
  id: string
  groupId: string
  senderId: string
  content: string
  createdAt: string
  updatedAt: string
  sender: UserSummary
}

export interface GroupTypingEvent {
  groupId: string
  userId: string
}

export interface FindGroupMessagesParams {
  limit?: number
  cursor?: string
}

export function getGroupMessages(
  groupId: string,
  params?: FindGroupMessagesParams,
) {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.cursor) searchParams.set("cursor", params.cursor)
  const queryString = searchParams.toString()

  return http.get<ApiResponse<GroupMessage[]>>(
    `/group-messaging/groups/${groupId}/messages${queryString ? `?${queryString}` : ""}`,
  )
}