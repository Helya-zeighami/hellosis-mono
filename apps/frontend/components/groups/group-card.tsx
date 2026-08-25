"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Location01Icon, UserMultipleIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import type { GroupListItem } from "@/services"

interface GroupCardProps {
  group: GroupListItem
}

export function GroupCard({ group }: GroupCardProps) {
  const t = useTranslations("groups.card")
  const creatorName = group.creator?.profile?.firstName ?? t("noCreator")

  return (
    <Card className="group/card relative overflow-hidden">
      {group.imageUrl && (
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={group.imageUrl}
            alt={group.name}
            className="size-full object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <CardHeader className={cn(!group.imageUrl && "pt-4")}>
        <h3 className="font-heading text-base font-semibold leading-snug text-foreground">
          {group.name}
        </h3>
        {group.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {group.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {group.city && (
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
              {group.city.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={UserMultipleIcon} className="size-3.5" />
            {t("memberCount", { count: group._count.members })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("createdBy", { name: creatorName })}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <Link
          href={`/groups/${group.id}`}
          className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
        >
          {t("view")}
        </Link>
      </CardFooter>
    </Card>
  )
}
