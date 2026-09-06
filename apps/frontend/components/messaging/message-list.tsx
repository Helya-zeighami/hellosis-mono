"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"

import type { Message } from "@/services"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"

export function MessageList({
  conversationId,
  messages,
  currentUserId,
  isTyping,
  typingName,
  isLoading = false,
}: {
  conversationId: string
  messages: Message[]
  currentUserId: string
  isTyping: boolean
  typingName: string
  isLoading?: boolean
}) {
  const t = useTranslations("messaging")
  const scrollRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(true)
  const firstLoadRef = useRef(true)

  useEffect(() => {
    firstLoadRef.current = true
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [conversationId])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (firstLoadRef.current) {
      el.scrollTop = el.scrollHeight
      firstLoadRef.current = false
    } else if (nearBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    nearBottomRef.current = distanceFromBottom < 80
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
    >
      {isLoading && messages.length === 0 ? (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {t("loadingMessages")}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {t("empty.messages")}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))}
          {isTyping && <TypingIndicator name={typingName} />}
        </div>
      )}
    </div>
  )
}