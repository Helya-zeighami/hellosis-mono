"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useAuthStore } from "@/stores/auth-store"
import { messagingSocket, type SocketStatus } from "@/services/socket"
import { type ApiResponse, type Message, type TypingEvent } from "@/services"
import {
  useConversation,
  useMessages,
  usePresence,
  updateConversationPreview,
} from "@/hooks/use-messaging"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { getDisplayName } from "./helpers"

const TYPING_STOP_DELAY = 1500

function ChatWindowSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border/60 px-3 py-2.5">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-10 w-2/3 max-w-64 rounded-2xl rounded-bl-md" />
        <Skeleton className="ms-auto h-10 w-1/2 max-w-64 rounded-2xl rounded-br-md" />
        <Skeleton className="h-10 w-2/3 max-w-64 rounded-2xl rounded-bl-md" />
      </div>
    </div>
  )
}

function ChatWindowError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("messaging")

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-destructive">{t("errors.conversation")}</p>
      <button
        type="button"
        onClick={onRetry}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        {t("retry")}
      </button>
    </div>
  )
}

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const t = useTranslations("messaging")
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((s) => s.session?.user.id ?? "")

  const {
    data: conversation,
    isLoading: conversationLoading,
    isError: conversationError,
    refetch: refetchConversation,
  } = useConversation(conversationId)

  const {
    data: history = [],
    isPending: messagesLoading,
    isError: messagesError,
    refetch: refetchMessages,
  } = useMessages(conversationId)

  const [liveByConversation, setLiveByConversation] = useState<
    Record<string, Message[]>
  >({})
  const [typingByConversation, setTypingByConversation] = useState<
    Record<string, boolean>
  >({})
  const [connectionStatus, setConnectionStatus] = useState<SocketStatus>(
    messagingSocket.getStatus(),
  )
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)

  const typingLockRef = useRef<{
    active: boolean
    timer: ReturnType<typeof setTimeout> | null
  }>({ active: false, timer: null })

  const otherUser = useMemo(() => {
    if (!conversation || !currentUserId) return null
    return conversation.userOne.id === currentUserId
      ? conversation.userTwo
      : conversation.userOne
  }, [conversation, currentUserId])

  const messages = useMemo(() => {
    const seen = new Set<string>()
    const merged: Message[] = []

    for (const message of [...history].reverse()) {
      if (!seen.has(message.id)) {
        seen.add(message.id)
        merged.push(message)
      }
    }
    for (const message of liveByConversation[conversationId] ?? []) {
      if (!seen.has(message.id)) {
        seen.add(message.id)
        merged.push(message)
      }
    }

    return merged
  }, [history, liveByConversation, conversationId])

  const presence = usePresence(otherUser ? [otherUser.id] : [])
  const isTyping = typingByConversation[conversationId] ?? false

  useEffect(() => {
    if (!conversationId) return

    let active = true
    const lock = typingLockRef.current

    const handleNewMessage = (response: ApiResponse<Message>) => {
      const message = response.data
      if (!message || message.conversationId !== conversationId) return

      setLiveByConversation((prev) => {
        const current = prev[conversationId] ?? []
        if (current.some((item) => item.id === message.id)) return prev
        return { ...prev, [conversationId]: [...current, message] }
      })

      updateConversationPreview(queryClient, message)
    }

    const handleTypingStart = (event: TypingEvent) => {
      if (event.conversationId !== conversationId) return
      setTypingByConversation((prev) => ({ ...prev, [conversationId]: true }))
    }

    const handleTypingStop = (event: TypingEvent) => {
      if (event.conversationId !== conversationId) return
      setTypingByConversation((prev) => ({ ...prev, [conversationId]: false }))
    }

    const handleConnect = () => {
      setConnectionStatus("connected")
      messagingSocket.emit("conversation:join", { conversationId })
    }

    const handleDisconnect = () => {
      setConnectionStatus("disconnected")
    }

    const handleConnectError = () => {
      setConnectionStatus("disconnected")
    }

    const offMessage = messagingSocket.on("message:new", handleNewMessage)
    const offTypingStart = messagingSocket.on("typing:start", handleTypingStart)
    const offTypingStop = messagingSocket.on("typing:stop", handleTypingStop)
    const offConnect = messagingSocket.on("connect", handleConnect)
    const offDisconnect = messagingSocket.on("disconnect", handleDisconnect)
    const offConnectError = messagingSocket.on("connect_error", handleConnectError)

    messagingSocket
      .ensureConnected()
      .then(() => {
        if (!active) return
        messagingSocket.emit("conversation:join", { conversationId })
        setConnectionStatus("connected")
      })
      .catch(() => {
        if (active) setConnectionStatus("disconnected")
      })

    return () => {
      active = false
      offMessage()
      offTypingStart()
      offTypingStop()
      offConnect()
      offDisconnect()
      offConnectError()

      if (lock.active) {
        messagingSocket.emit("typing:stop", { conversationId })
        lock.active = false
      }
      if (lock.timer) {
        clearTimeout(lock.timer)
        lock.timer = null
      }
    }
  }, [conversationId, queryClient])

  const handleInputChange = (value: string) => {
    setInput(value)

    const lock = typingLockRef.current
    if (!messagingSocket.isConnected()) return

    if (value.trim().length > 0) {
      if (!lock.active) {
        messagingSocket.emit("typing:start", { conversationId })
        lock.active = true
      }
      if (lock.timer) clearTimeout(lock.timer)
      lock.timer = setTimeout(() => {
        if (typingLockRef.current.active) {
          messagingSocket.emit("typing:stop", { conversationId })
          typingLockRef.current.active = false
        }
        typingLockRef.current.timer = null
      }, TYPING_STOP_DELAY)
    }
  }

  const handleSend = async () => {
    const content = input.trim()
    if (!content || isSending || !conversationId) return

    setIsSending(true)

    const lock = typingLockRef.current
    if (lock.active) {
      messagingSocket.emit("typing:stop", { conversationId })
      lock.active = false
    }
    if (lock.timer) {
      clearTimeout(lock.timer)
      lock.timer = null
    }

    try {
      const socket = await messagingSocket.ensureConnected()
      setInput("")
      socket.emit("message:send", { conversationId, content }, () => {
        setIsSending(false)
      })
      setTimeout(() => setIsSending(false), 8000)
    } catch {
      setIsSending(false)
      toast.error(t("errors.send"))
    }
  }

  const otherUserName = otherUser ? (getDisplayName(otherUser) ?? t("unknown")) : ""

  if (conversationLoading) {
    return <ChatWindowSkeleton />
  }

  if (conversationError || !conversation || !otherUser) {
    return <ChatWindowError onRetry={refetchConversation} />
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader
        user={otherUser}
        isOnline={presence[otherUser.id] ?? false}
        connectionStatus={connectionStatus}
      />

      {messagesError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm text-destructive">{t("errors.messages")}</p>
          <button
            type="button"
            onClick={() => refetchMessages()}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("retry")}
          </button>
        </div>
      ) : (
        <MessageList
          conversationId={conversationId}
          messages={messages}
          currentUserId={currentUserId}
          isTyping={isTyping}
          typingName={otherUserName}
          isLoading={messagesLoading}
        />
      )}

      <MessageInput
        value={input}
        onChange={handleInputChange}
        onSend={handleSend}
        isSending={isSending}
      />
    </div>
  )
}