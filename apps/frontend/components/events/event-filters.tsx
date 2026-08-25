"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Location01Icon, Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useCitySearch } from "@/hooks/use-profile"
import type { City } from "@/services"

interface EventFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  selectedCity: City | null
  onCityChange: (city: City | null) => void
}

export function EventFilters({
  search,
  onSearchChange,
  selectedCity,
  onCityChange,
}: EventFiltersProps) {
  const t = useTranslations("events.filters")
  const [cityOpen, setCityOpen] = useState(false)
  const [cityQuery, setCityQuery] = useState("")
  const [debouncedCityQuery, setDebouncedCityQuery] = useState("")
  const cityInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCityQuery(cityQuery), 300)
    return () => clearTimeout(timer)
  }, [cityQuery])

  const { data: cityResults, isLoading: citiesLoading } =
    useCitySearch(debouncedCityQuery)

  const handleCityOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setCityQuery("")
      setDebouncedCityQuery("")
    }
    setCityOpen(nextOpen)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="ps-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Popover open={cityOpen} onOpenChange={handleCityOpenChange}>
          <PopoverTrigger
            render={<Button variant="outline" className="gap-1.5" />}
          >
            <HugeiconsIcon icon={Location01Icon} className="size-4" />
            <span
              className={cn(
                "truncate",
                !selectedCity && "text-muted-foreground",
              )}
            >
              {selectedCity?.name ?? t("allCities")}
            </span>
          </PopoverTrigger>
          <PopoverContent style={{ width: "var(--anchor-width)" }}>
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                ref={cityInputRef}
                autoFocus
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder={t("searchCitiesPlaceholder")}
                className="ps-9"
              />
            </div>
            <ScrollArea className="max-h-64">
              <div className="flex flex-col gap-1">
                {debouncedCityQuery.trim() === "" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      onCityChange(null)
                      setCityOpen(false)
                    }}
                  >
                    {t("allCities")}
                  </Button>
                )}

                {debouncedCityQuery.trim() === "" && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    {t("typeToSearch")}
                  </p>
                )}

                {debouncedCityQuery.trim() !== "" && citiesLoading && (
                  <div className="flex flex-col gap-2 p-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-xl" />
                    ))}
                  </div>
                )}

                {debouncedCityQuery.trim() !== "" &&
                  !citiesLoading &&
                  cityResults &&
                  cityResults.length > 0 &&
                  cityResults.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        onCityChange(city)
                        setCityOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors outline-none hover:bg-accent",
                        selectedCity?.id === city.id &&
                          "bg-accent text-accent-foreground",
                      )}
                    >
                      <span className="truncate">{city.name}</span>
                    </button>
                  ))}

                {debouncedCityQuery.trim() !== "" &&
                  !citiesLoading &&
                  cityResults &&
                  cityResults.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      {t("noResults")}
                    </p>
                  )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {selectedCity && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onCityChange(null)}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
