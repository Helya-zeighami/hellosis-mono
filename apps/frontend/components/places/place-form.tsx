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
import { ImageUpload } from "@/components/common/image-upload"
import { useCitySearch } from "@/hooks/use-profile"
import { usePlaceCategories } from "@/hooks/use-places"
import type { City, PlaceCategory } from "@/services"

interface PlaceFormProps {
  mode: "create" | "edit"
  initialName?: string
  initialDescription?: string
  initialCity?: City | null
  initialAddress?: string
  initialCategory?: PlaceCategory | null
  initialImageUrl?: string
  onSubmit: (data: {
    name: string
    description?: string
    cityId?: string
    address?: string
    categoryId?: string
    imageUrl?: string
  }) => void
  isPending?: boolean
  submitLabel?: string
}

export function PlaceForm({
  mode,
  initialName = "",
  initialDescription = "",
  initialCity = null,
  initialAddress = "",
  initialCategory = null,
  initialImageUrl = "",
  onSubmit,
  isPending = false,
  submitLabel,
}: PlaceFormProps) {
  const t = useTranslations("places.form")
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [selectedCity, setSelectedCity] = useState<City | null>(initialCity)
  const [address, setAddress] = useState(initialAddress)
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceCategory | null>(initialCategory)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)

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

  const { data: categories, isLoading: categoriesLoading } =
    usePlaceCategories()

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
      cityId: selectedCity?.id,
      address: address.trim() || undefined,
      categoryId: selectedCategory?.id,
      imageUrl: imageUrl.trim() || undefined,
    })
  }

  const isValid = name.trim()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="place-name">{t("nameLabel")}</Label>
        <Input
          id="place-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          required
          minLength={1}
          maxLength={200}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="place-description">{t("descriptionLabel")}</Label>
        <Textarea
          id="place-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("cityLabel")}</Label>
        <Popover open={cityOpen} onOpenChange={handleCityOpenChange}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
              />
            }
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="place-address">{t("addressLabel")}</Label>
        <Input
          id="place-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t("addressPlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("categoryLabel")}</Label>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
              />
            }
          >
            <span
              className={cn(
                "truncate",
                !selectedCategory && "text-muted-foreground",
              )}
            >
              {selectedCategory?.name ?? t("categoryPlaceholder")}
            </span>
          </PopoverTrigger>
          <PopoverContent style={{ width: "var(--anchor-width)" }}>
            <ScrollArea className="max-h-64">
              <div className="flex flex-col gap-1">
                {categoriesLoading && (
                  <div className="flex flex-col gap-2 p-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-xl" />
                    ))}
                  </div>
                )}
                {!categoriesLoading &&
                  categories &&
                  categories.length > 0 &&
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors outline-none hover:bg-accent",
                        selectedCategory?.id === cat.id &&
                          "bg-accent text-accent-foreground",
                      )}
                    >
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                {!categoriesLoading &&
                  categories &&
                  categories.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      {t("noCategories")}
                    </p>
                  )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("clearCity")}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("imageLabel")}</Label>
        <ImageUpload value={imageUrl} onChange={(url) => setImageUrl(url ?? "")} label={t("uploadImage")} helpText={t("imageHelp")} />
      </div>

      <Button type="submit" disabled={isPending || !isValid}>
        {isPending && (
          <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
        )}
        {submitLabel ?? (mode === "create" ? t("create") : t("save"))}
      </Button>
    </form>
  )
}
