"use client"

import { useMemo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { BubbleChatIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { useAuthStore } from "@/stores/auth-store"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useConversations, usePresence } from "@/hooks/use-messaging"
import { ConversationItem } from "./conversation-item"
import { getOtherUser } from "./helpers"

function ConversationListSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-2 py-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ConversationListError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("messaging")

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-destructive">{t("errors.conversations")}</p>
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

function ConversationListEmpty() {
  const t = useTranslations("messaging")

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon icon={BubbleChatIcon} className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{t("empty.noConversations")}</p>
    </div>
  )
}

export function ConversationList({
  activeConversationId,
}: {
  activeConversationId?: string
}) {
  const t = useTranslations("messaging")
  const currentUserId = useAuthStore((s) => s.session?.user.id ?? "")
  const { data: conversations, isLoading, isError, refetch } = useConversations()

  const otherUserIds = useMemo(
    () =>
      (conversations ?? [])
        .filter(() => Boolean(currentUserId))
        .map((c) => getOtherUser(c, currentUserId).id),
    [conversations, currentUserId],
  )
  const presence = usePresence(otherUserIds)

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="font-heading text-base font-semibold text-foreground">
          {t("title")}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : isError || !conversations ? (
          <ConversationListError onRetry={refetch} />
        ) : conversations.length === 0 ? (
          <ConversationListEmpty />
        ) : (
          <ul className="flex flex-col">
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation, currentUserId)
              return (
                <li key={conversation.id} className="border-b border-border/40 last:border-b-0">
                  <ConversationItem
                    conversation={conversation}
                    currentUserId={currentUserId}
                    isOnline={presence[otherUser.id] ?? false}
                    isActive={conversation.id === activeConversationId}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}