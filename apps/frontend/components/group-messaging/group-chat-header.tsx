"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Loading03Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SocketStatus } from "@/services/socket"

export function GroupChatHeader({
  groupId,
  groupName,
  groupImageUrl,
  memberCount,
  connectionStatus,
}: {
  groupId: string
  groupName: string
  groupImageUrl: string | null
  memberCount: number
  connectionStatus: SocketStatus
}) {
  const t = useTranslations("groupMessaging")

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2.5">
      <Link
        href={`/dashboard/groups/${groupId}`}
        aria-label={t("backToGroup")}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "md:hidden")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} />
      </Link>

      <Avatar size="sm">
        {groupImageUrl && <AvatarImage src={groupImageUrl} alt={groupName} />}
        <AvatarFallback className="bg-rose-100 text-rose-700">
          <HugeiconsIcon icon={UserMultipleIcon} className="size-3.5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-sm font-semibold text-foreground">{groupName}</p>
        <p className="text-xs text-muted-foreground">
          {t("members", { count: memberCount })}
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