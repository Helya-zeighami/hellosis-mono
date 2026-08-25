"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Skeleton } from "@/components/ui/skeleton"
import type { EventListItem } from "@/services"
import { EventCard } from "./event-card"

interface EventListProps {
  events: EventListItem[]
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage?: boolean
  onLoadMore: () => void
}

function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-0">
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function EventList({
  events,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
}: EventListProps) {
  const t = useTranslations("events")

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 rounded-2xl border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            {isFetchingNextPage && (
              <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
            )}
            {t("loadMore")}
          </button>
        </div>
      )}
    </div>
  )
}
