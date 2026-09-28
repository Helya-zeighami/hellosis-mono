"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Location01Icon, UserMultipleIcon, PencilIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import type { GroupDetail } from "@/services"

interface GroupHeaderProps {
  group: GroupDetail
  currentUserId: string
}

export function GroupHeader({ group, currentUserId }: GroupHeaderProps) {
  const t = useTranslations("groups.detail")
  const isOwnerOrAdmin = group.members.some(
    (m) =>
      m.userId === currentUserId &&
      (m.role === "OWNER" || m.role === "ADMIN"),
  )

  const creatorName =
    group.creator?.profile?.firstName ?? t("noCreator")

  return (
    <div className="flex flex-col gap-4">
      {group.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-2xl sm:h-64">
          <img
            src={group.imageUrl}
            alt={group.name}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {group.name}
          </h1>
          {isOwnerOrAdmin && (
            <Link
              href={`/dashboard/groups/${group.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <HugeiconsIcon icon={PencilIcon} className="size-3.5" />
              {t("edit")}
            </Link>
          )}
        </div>

        {group.description && (
          <p className="text-sm text-muted-foreground">{group.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {group.city && (
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
              {group.city.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={UserMultipleIcon} className="size-3.5" />
            {t("memberCount", { count: group.members.length })}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("createdBy", { name: creatorName })}
        </p>
      </div>
    </div>
  )
}
