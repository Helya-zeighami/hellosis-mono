"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useCitySearch } from "@/hooks/use-profile"
import type { City } from "@/services"

interface CityComboboxProps {
  selectedCity: City | null
  onChange: (city: City | null) => void
  placeholder?: string
  searchPlaceholder?: string
  noCityLabel?: string
  noResultsLabel?: string
  typeToSearchLabel?: string
  searchErrorLabel?: string
  retryLabel?: string
}

export function CityCombobox({
  selectedCity,
  onChange,
  placeholder = "Select a city",
  searchPlaceholder = "Search cities...",
  noCityLabel = "No city",
  noResultsLabel = "No cities found",
  typeToSearchLabel = "Type to search cities",
  searchErrorLabel = "Search failed",
  retryLabel = "Retry",
}: CityComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setQuery("")
      setDebouncedQuery("")
    }
    setOpen(nextOpen)
  }

  const { data: results, isLoading, isError, refetch } = useCitySearch(debouncedQuery)

  const handleSelect = (city: City | null) => {
    onChange(city)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={<Button type="button" variant="outline" className="w-full justify-between" />}
      >
        <span className={cn("truncate", !selectedCity && "text-muted-foreground")}>
          {selectedCity?.name ?? placeholder}
        </span>
        <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent style={{ width: "var(--anchor-width)" }}>
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="ps-9"
          />
        </div>
        <ScrollArea className="max-h-64">
          <div className="flex flex-col gap-1">
            {query.trim() === "" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleSelect(null)}
              >
                {noCityLabel}
              </Button>
            )}

            {query.trim() === "" ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">{typeToSearchLabel}</p>
            ) : null}

            {query.trim() !== "" && isLoading ? (
              <div className="flex flex-col gap-2 p-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-full rounded-xl" />
                ))}
              </div>
            ) : null}

            {query.trim() !== "" && isError ? (
              <div className="flex flex-col items-start gap-2 p-3">
                <p className="text-sm text-destructive">{searchErrorLabel}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                  {retryLabel}
                </Button>
              </div>
            ) : null}

            {query.trim() !== "" && !isLoading && !isError ? (
              results && results.length > 0 ? (
                results.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-start text-sm transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
                      selectedCity?.id === city.id &&
                        "bg-accent text-accent-foreground",
                    )}
                  >
                    <span className="truncate">{city.name}</span>
                    {selectedCity?.id === city.id && (
                      <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4 shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">{noResultsLabel}</p>
              )
            ) : null}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
