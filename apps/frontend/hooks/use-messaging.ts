import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import {
  getConversations,
  getConversation,
  getMessages,
  createConversation,
  queryKeys,
  HttpError,
  type ApiResponse,
  type Conversation,
  type Message,
} from "@/services"
import { checkPresence, messagingSocket } from "@/services/socket"

export function updateConversationPreview(
  queryClient: QueryClient,
  message: Message,
) {
  queryClient.setQueryData<Conversation[]>(
    queryKeys.messages.conversations,
    (conversations) => {
      if (!conversations) return conversations

      const index = conversations.findIndex(
        (conversation) => conversation.id === message.conversationId,
      )
      if (index === -1) return conversations

      const conversation = conversations[index]
      const updated: Conversation = {
        ...conversation,
        lastMessageAt: message.createdAt,
        lastMessage: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
        },
      }

      const next = [...conversations]
      next.splice(index, 1)
      next.unshift(updated)
      return next
    },
  )
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: queryKeys.messages.conversations,
    queryFn: () => getConversations().then((res) => res.data as Conversation[]),
  })
}

export function useConversation(conversationId: string) {
  return useQuery<Conversation>({
    queryKey: queryKeys.messages.conversation(conversationId),
    queryFn: () =>
      getConversation(conversationId).then((res) => res.data as Conversation),
    enabled: conversationId.length > 0,
  })
}

export function useMessages(conversationId: string) {
  return useQuery<Message[]>({
    queryKey: queryKeys.messages.messages(conversationId),
    queryFn: () =>
      getMessages(conversationId).then((res) => res.data as Message[]),
    enabled: conversationId.length > 0,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Conversation>, HttpError, string>({
    mutationFn: (userId) => createConversation(userId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations })
      if (response.data) {
        queryClient.setQueryData(
          queryKeys.messages.conversation(response.data.id),
          response.data,
        )
      }
    },
  })
}

export function usePresence(userIds: string[]) {
  const [presence, setPresence] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (userIds.length === 0) return

    let cancelled = false

    const check = async () => {
      try {
        await messagingSocket.ensureConnected()
      } catch {
        return
      }

      const results = await Promise.all(userIds.map((id) => checkPresence(id)))
      if (cancelled) return

      setPresence((prev) => {
        const next = { ...prev }
        results.forEach((result) => {
          next[result.userId] = result.isOnline
        })
        return next
      })
    }

    check()

    return () => {
      cancelled = true
    }
  }, [userIds])

  return presence
}