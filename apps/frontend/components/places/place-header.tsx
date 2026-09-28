"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Location01Icon,
  Tag01Icon,
  PencilIcon,
} from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import type { PlaceDetail } from "@/services"

interface PlaceHeaderProps {
  place: PlaceDetail
  currentUserId: string
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function PlaceHeader({ place, currentUserId }: PlaceHeaderProps) {
  const t = useTranslations("places.detail")
  const isCreator = place.createdById === currentUserId
  const creatorName =
    place.createdBy?.profile?.firstName ?? t("noCreator")

  return (
    <div className="flex flex-col gap-4">
      {place.imageUrl && (
        <div className="relative h-64 w-full overflow-hidden rounded-2xl">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {place.name}
        </h1>
        {isCreator && (
          <Link
            href={`/dashboard/places/${place.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <HugeiconsIcon icon={PencilIcon} className="size-3.5" />
            {t("edit")}
          </Link>
        )}
      </div>

      {place.description && (
        <p className="text-sm text-muted-foreground">{place.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {place.category && (
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Tag01Icon} className="size-3.5" />
            {place.category.name}
          </span>
        )}
        {place.city && (
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
            {place.city.name}
          </span>
        )}
        {place.address && (
          <span className="text-xs">{place.address}</span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t("createdBy", { name: creatorName })}
      </p>
      <p className="text-xs text-muted-foreground">
        {t("createdAt", { date: formatDate(place.createdAt) })}
      </p>
    </div>
  )
}
