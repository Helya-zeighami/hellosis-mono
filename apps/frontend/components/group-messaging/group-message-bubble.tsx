"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon } from "@hugeicons/core-free-icons"
import { useTranslations, useFormatter } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { GroupMessage } from "@/services"
import { getDisplayName, getInitials } from "@/components/messaging/helpers"

function MessageTimestamp({
  createdAt,
  className,
}: {
  createdAt: string
  className?: string
}) {
  const format = useFormatter()
  return (
    <span
      className={cn(
        "mt-0.5 flex justify-end pt-0.5 text-[10px] leading-none",
        className,
      )}
    >
      {format.dateTime(new Date(createdAt), {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  )
}

export function GroupMessageBubble({
  message,
  isOwn,
  showAuthor,
}: {
  message: GroupMessage
  isOwn: boolean
  showAuthor: boolean
}) {
  const t = useTranslations("groupMessaging")
  const name = getDisplayName(message.sender) ?? t("unknown")
  const initials = getInitials(message.sender)

  if (isOwn) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <MessageTimestamp
            className="text-primary-foreground/70"
            createdAt={message.createdAt}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full items-end gap-2">
      {showAuthor ? (
        <Avatar size="sm" className="shrink-0">
          {message.sender.profile?.avatarUrl && (
            <AvatarImage
              src={message.sender.profile.avatarUrl}
              alt={name}
            />
          )}
          <AvatarFallback className="bg-rose-100 text-rose-700">
            {initials ?? <HugeiconsIcon icon={UserCircleIcon} className="size-3" />}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="size-6 shrink-0" aria-hidden />
      )}

      <div className="min-w-0">
        {showAuthor && (
          <p className="mb-0.5 px-1 text-xs font-medium text-foreground">
            {name}
          </p>
        )}
        <div
          className={cn(
            "w-fit max-w-[78%] rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2 text-sm text-secondary-foreground shadow-sm",
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <MessageTimestamp
            className="text-muted-foreground"
            createdAt={message.createdAt}
          />
        </div>
      </div>
    </div>
  )
}