"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Skeleton } from "@/components/ui/skeleton"
import type { PlaceListItem } from "@/services"
import { PlaceCard } from "./place-card"

interface PlaceListProps {
  places: PlaceListItem[]
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage?: boolean
  onLoadMore: () => void
}

function PlaceCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-0">
      <Skeleton className="h-40 w-full rounded-t-2xl" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function PlaceList({
  places,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
}: PlaceListProps) {
  const t = useTranslations("places")

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PlaceCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (places.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
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
              <HugeiconsIcon
                icon={Loading03Icon}
                className="size-4 animate-spin"
              />
            )}
            {t("loadMore")}
          </button>
        </div>
      )}
    </div>
  )
}
