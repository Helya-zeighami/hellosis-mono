"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon } from "@hugeicons/core-free-icons"
import { useFormatter, useTranslations } from "next-intl"
import { useQueryClient } from "@tanstack/react-query"

import { Link } from "@/i18n/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getMessages, queryKeys, type Conversation } from "@/services"
import { OnlineIndicator } from "./online-indicator"
import { getDisplayName, getInitials, getOtherUser } from "./helpers"

export function ConversationItem({
  conversation,
  currentUserId,
  isOnline,
  isActive = false,
}: {
  conversation: Conversation
  currentUserId: string
  isOnline: boolean
  isActive?: boolean
}) {
  const t = useTranslations("messaging")
  const format = useFormatter()
  const queryClient = useQueryClient()

  const otherUser = getOtherUser(conversation, currentUserId)
  const fullName = getDisplayName(otherUser) ?? t("unknown")
  const initials = getInitials(otherUser)

  const lastMessage = conversation.lastMessage
  const timeLabel = conversation.lastMessageAt
    ? format.relativeTime(new Date(conversation.lastMessageAt))
    : null

  const prepareConversation = () => {
    // The list already contains all data needed by the chat header. Seed it
    // before the route changes, then warm the history request in parallel.
    queryClient.setQueryData(queryKeys.messages.conversation(conversation.id), conversation)
    void queryClient.prefetchQuery({
      queryKey: queryKeys.messages.messages(conversation.id),
      queryFn: () => getMessages(conversation.id).then((response) => response.data ?? []),
      staleTime: 30_000,
    })
  }

  return (
    <Link
      href={`/dashboard/messages/${conversation.id}`}
      prefetch
      onPointerEnter={prepareConversation}
      onFocus={prepareConversation}
      onClick={prepareConversation}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60",
        "focus-visible:bg-muted/60 focus-visible:outline-none",
        isActive && "bg-muted/80",
      )}
    >
      <div className="relative shrink-0">
        <Avatar>
          {otherUser.profile?.avatarUrl && (
            <AvatarImage src={otherUser.profile.avatarUrl} alt={fullName} />
          )}
          <AvatarFallback className="bg-rose-100 text-rose-700">
            {initials ?? <HugeiconsIcon icon={UserCircleIcon} className="size-4" />}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <OnlineIndicator
            isOnline
            className="absolute -end-0.5 -bottom-0.5 ring-2 ring-card"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
          {timeLabel && (
            <span className="shrink-0 text-xs text-muted-foreground">{timeLabel}</span>
          )}
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {lastMessage ? lastMessage.content : t("empty.noLatestMessage")}
        </p>
      </div>
    </Link>
  )
}
