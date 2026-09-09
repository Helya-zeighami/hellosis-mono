"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"

import type { GroupMessage } from "@/services"
import { GroupMessageBubble } from "./group-message-bubble"
import { GroupTypingIndicator } from "./group-typing-indicator"

export function GroupMessageList({
  messages,
  currentUserId,
  typingNames,
  isLoading = false,
  hasMore = false,
  isFetchingOlder = false,
  onLoadOlder,
}: {
  messages: GroupMessage[]
  currentUserId: string
  typingNames: string[]
  isLoading?: boolean
  hasMore?: boolean
  isFetchingOlder?: boolean
  onLoadOlder?: () => void
}) {
  const t = useTranslations("groupMessaging")
  const scrollRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(true)
  const firstLoadRef = useRef(true)
  const preserveScrollRef = useRef<{
    scrollTop: number
    scrollHeight: number
  } | null>(null)

  useEffect(() => {
    firstLoadRef.current = true
    preserveScrollRef.current = null
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [currentUserId])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const preserve = preserveScrollRef.current
    if (preserve) {
      el.scrollTop = preserve.scrollTop + (el.scrollHeight - preserve.scrollHeight)
      preserveScrollRef.current = null
      return
    }

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

    if (
      el.scrollTop <= 24 &&
      hasMore &&
      !isFetchingOlder &&
      !preserveScrollRef.current
    ) {
      preserveScrollRef.current = {
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
      }
      onLoadOlder?.()
    }
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
          {isFetchingOlder && (
            <p className="py-1 text-center text-xs text-muted-foreground">
              {t("loadingOlder")}
            </p>
          )}
          {messages.map((message, index) => (
            <GroupMessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              showAuthor={
                message.senderId !== currentUserId &&
                (index === 0 ||
                  messages[index - 1].senderId !== message.senderId)
              }
            />
          ))}
          <GroupTypingIndicator names={typingNames} />
        </div>
      )}
    </div>
  )
}