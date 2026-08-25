"use client"

import { useState, useEffect, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useCitySearch } from "@/hooks/use-profile"
import type { City } from "@/services"

interface GroupFormProps {
  mode: "create" | "edit"
  initialName?: string
  initialDescription?: string
  initialImageUrl?: string
  initialCity?: City | null
  onSubmit: (data: {
    name: string
    description?: string
    imageUrl?: string
    cityId?: string
  }) => void
  isPending?: boolean
  submitLabel?: string
}

export function GroupForm({
  mode,
  initialName = "",
  initialDescription = "",
  initialImageUrl = "",
  initialCity = null,
  onSubmit,
  isPending = false,
  submitLabel,
}: GroupFormProps) {
  const t = useTranslations("groups.form")
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [selectedCity, setSelectedCity] = useState<City | null>(initialCity)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      cityId: selectedCity?.id || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="group-name">{t("nameLabel")}</Label>
        <Input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          required
          minLength={3}
          maxLength={100}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="group-description">{t("descriptionLabel")}</Label>
        <Textarea
          id="group-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="group-image">{t("imageLabel")}</Label>
        <Input
          id="group-image"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder={t("imagePlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("cityLabel")}</Label>
        <Popover open={cityOpen} onOpenChange={handleCityOpenChange}>
          <PopoverTrigger
            render={<Button type="button" variant="outline" className="w-full justify-between" />}
          >
            <span
              className={cn(
                "truncate",
                !selectedCity && "text-muted-foreground",
              )}
            >
              {selectedCity?.name ?? t("cityPlaceholder")}
            </span>
          </PopoverTrigger>
          <PopoverContent style={{ width: "var(--anchor-width)" }}>
            <div className="relative">
              <Input
                ref={cityInputRef}
                autoFocus
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder={t("citySearchPlaceholder")}
              />
            </div>
            <ScrollArea className="max-h-64">
              <div className="flex flex-col gap-1">
                {debouncedCityQuery.trim() === "" && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    {t("cityTypeToSearch")}
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
                  cityResults?.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city)
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
                      {t("cityNoResults")}
                    </p>
                  )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        {selectedCity && (
          <button
            type="button"
            onClick={() => setSelectedCity(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("clearCity")}
          </button>
        )}
      </div>

      <Button type="submit" disabled={isPending || !name.trim()}>
        {isPending && (
          <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
        )}
        {submitLabel ?? (mode === "create" ? t("create") : t("save"))}
      </Button>
    </form>
  )
}
