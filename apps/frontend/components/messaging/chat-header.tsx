"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Loading03Icon, UserCircleIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SocketStatus } from "@/services/socket"
import type { UserSummary } from "@/services"
import { getDisplayName, getInitials } from "./helpers"
import { OnlineIndicator } from "./online-indicator"

export function ChatHeader({
  user,
  isOnline,
  connectionStatus,
}: {
  user: UserSummary
  isOnline: boolean
  connectionStatus: SocketStatus
}) {
  const t = useTranslations("messaging")

  const fullName = getDisplayName(user) ?? t("unknown")
  const initials = getInitials(user)

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2.5">
      <Link
        href="/messages"
        aria-label={t("backToConversations")}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "md:hidden")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} />
      </Link>

      <Avatar size="sm">
        {user.profile?.avatarUrl && (
          <AvatarImage src={user.profile.avatarUrl} alt={fullName} />
        )}
        <AvatarFallback className="bg-rose-100 text-rose-700">
          {initials ?? <HugeiconsIcon icon={UserCircleIcon} className="size-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <OnlineIndicator isOnline={isOnline} />
          {isOnline ? t("online") : t("offline")}
        </p>
      </div>

      {connectionStatus !== "connected" && (
        <p className="ms-auto hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
          {t("connection")}
        </p>
      )}
    </div>
  )
}