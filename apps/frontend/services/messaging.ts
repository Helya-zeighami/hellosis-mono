import { http } from "./http"
import type { ApiResponse } from "./profile"

export type MessageStatus = "SENT" | "DELIVERED" | "READ"

export interface ProfileSummary {
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
}

export interface UserSummary {
  id: string
  profile: ProfileSummary | null
}

export interface LastMessagePreview {
  id: string
  content: string
  senderId: string
  createdAt: string
}

export interface Conversation {
  id: string
  userOneId: string
  userTwoId: string
  userOne: UserSummary
  userTwo: UserSummary
  lastMessageAt: string | null
  lastMessage: LastMessagePreview | null
  createdAt: string
  updatedAt: string
  _count?: { messages: number }
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  status: MessageStatus
  createdAt: string
  updatedAt: string
  sender: UserSummary
}

export interface TypingEvent {
  conversationId: string
  userId: string
}

export interface PresenceResponse {
  userId: string
  isOnline: boolean
}

export interface FindMessagesParams {
  limit?: number
  cursor?: string
}

export function getConversations() {
  return http.get<ApiResponse<Conversation[]>>("/messaging/conversations")
}

export function createConversation(userId: string) {
  return http.post<ApiResponse<Conversation>>("/messaging/conversations", { userId })
}

export function getConversation(conversationId: string) {
  return http.get<ApiResponse<Conversation>>(`/messaging/conversations/${conversationId}`)
}

export function getMessages(conversationId: string, params?: FindMessagesParams) {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.cursor) searchParams.set("cursor", params.cursor)
  const queryString = searchParams.toString()

  return http.get<ApiResponse<Message[]>>(
    `/messaging/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ""}`,
  )
}