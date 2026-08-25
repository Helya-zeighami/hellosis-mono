"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Location01Icon, ThumbsUpIcon, ThumbsDownIcon, Message01Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import type { EventListItem } from "@/services"

interface EventCardProps {
  event: EventListItem
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatEventTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("events.card")
  const creatorName =
    event.creator?.profile?.firstName ?? t("noCreator")

  return (
    <Card className="group/card relative overflow-hidden">
      <CardHeader>
        <h3 className="font-heading text-base font-semibold leading-snug text-foreground">
          {event.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {event.description}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" />
            {formatEventDate(event.startTime)} · {formatEventTime(event.startTime)}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
            {event.city.name}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={ThumbsUpIcon} className="size-3.5" />
            {event._count.likes}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={ThumbsDownIcon} className="size-3.5" />
            {event._count.dislikes}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Message01Icon} className="size-3.5" />
            {event._count.comments}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("createdBy", { name: creatorName })}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <Link
          href={`/events/${event.id}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "w-full",
          })}
        >
          {t("view")}
        </Link>
      </CardFooter>
    </Card>
  )
}
