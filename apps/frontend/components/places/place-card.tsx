"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Location01Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PlaceListItem } from "@/services"

interface PlaceCardProps {
  place: PlaceListItem
}

export function PlaceCard({ place }: PlaceCardProps) {
  const t = useTranslations("places.card")

  return (
    <Link href={`/places/${place.id}`} className="group/card block">
      <Card className="relative overflow-hidden transition-colors group-hover/card:bg-accent/50">
        {place.imageUrl && (
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={place.imageUrl}
              alt={place.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-base font-semibold leading-snug text-foreground">
              {place.name}
            </h3>
            {place.category && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {place.category.name}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {place.city && (
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
                {place.city.name}
              </span>
            )}
            {place.address && (
              <span className="truncate text-xs">{place.address}</span>
            )}
          </div>

          {place.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {place.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <span
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "w-full",
            })}
          >
            {t("view")}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
