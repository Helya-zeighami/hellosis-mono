"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Location01Icon,
  PencilIcon,
} from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import type { EventDetail } from "@/services"

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
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

interface EventHeaderProps {
  event: EventDetail
  currentUserId: string
}

export function EventHeader({ event, currentUserId }: EventHeaderProps) {
  const t = useTranslations("events.detail")
  const isCreator = event.creatorId === currentUserId
  const creatorName =
    event.creator?.profile?.firstName ?? t("noCreator")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {event.title}
        </h1>
        {isCreator && (
          <Link
            href={`/events/${event.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <HugeiconsIcon icon={PencilIcon} className="size-3.5" />
            {t("edit")}
          </Link>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{event.description}</p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" />
          {formatEventDate(event.startTime)} · {formatEventTime(event.startTime)}
          {event.endTime && ` – ${formatEventTime(event.endTime)}`}
        </span>
        <span className="flex items-center gap-1">
          <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
          {event.city.name}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("createdBy", { name: creatorName })}
      </p>
    </div>
  )
}
