"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { usePlace, useUpdatePlace } from "@/hooks/use-places"
import { PlaceForm } from "./place-form"
import { PlaceSkeleton } from "./place-skeleton"

interface EditPlaceFormProps {
  placeId: string
}

export function EditPlaceForm({ placeId }: EditPlaceFormProps) {
  const t = useTranslations("places")
  const router = useRouter()
  const { data: place, isLoading, isError } = usePlace(placeId)
  const updatePlace = useUpdatePlace(placeId)

  const handleSubmit = (data: {
    name: string
    description?: string
    cityId?: string
    address?: string
    categoryId?: string
    imageUrl?: string
  }) => {
    updatePlace.mutate(data, {
      onSuccess: () => {
        toast.success(t("toasts.updated"))
        router.push(`/dashboard/places/${placeId}`)
      },
      onError: () => {
        toast.error(t("errors.update"))
      },
    })
  }

  if (isLoading) return <PlaceSkeleton />
  if (isError || !place) return null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-24 pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("editPage.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("editPage.description")}
        </p>
      </div>
      <PlaceForm
        mode="edit"
        initialName={place.name}
        initialDescription={place.description ?? ""}
        initialCity={place.city}
        initialAddress={place.address ?? ""}
        initialCategory={place.category}
        initialImageUrl={place.imageUrl ?? ""}
        onSubmit={handleSubmit}
        isPending={updatePlace.isPending}
      />
    </div>
  )
}
