"use client"

import { useState, useEffect, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CompassIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import { useEvents } from "@/hooks/use-events"
import { EventFilters } from "./event-filters"
import { EventList } from "./event-list"
import type { City } from "@/services"

export function EventsPage() {
  const t = useTranslations("events")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEvents(debouncedSearch, selectedCity?.id ?? null)

  const allEvents = data?.pages?.flat() ?? []

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <EventFilters
        search={search}
        onSearchChange={setSearch}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
      />

      {isError ? (
        <div className="flex w-full flex-col items-start gap-3 rounded-2xl bg-destructive/10 p-6 text-sm text-destructive">
          <p>{t("errors.load")}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("retry")}
          </button>
        </div>
      ) : allEvents.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-muted-foreground/20 px-6 py-16 text-center">
          <HugeiconsIcon
            icon={CompassIcon}
            className="size-10 text-muted-foreground/50"
          />
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              {t("empty.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("empty.description")}
            </p>
          </div>
          <Link
            href="/dashboard/events/create"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("empty.action")}
          </Link>
        </div>
      ) : (
        <EventList
          events={allEvents}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  )
}
