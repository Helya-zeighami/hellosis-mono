"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useCreatePlace } from "@/hooks/use-places"
import { PlaceForm } from "./place-form"

export function CreatePlaceForm() {
  const t = useTranslations("places")
  const router = useRouter()
  const createPlace = useCreatePlace()

  const handleSubmit = (data: {
    name: string
    description?: string
    cityId?: string
    address?: string
    categoryId?: string
    imageUrl?: string
  }) => {
    createPlace.mutate(data, {
      onSuccess: (res) => {
        toast.success(t("toasts.created"))
        router.push(`/places/${res.data?.id}`)
      },
      onError: () => {
        toast.error(t("errors.create"))
      },
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-24 pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("createPage.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("createPage.description")}
        </p>
      </div>
      <PlaceForm
        mode="create"
        onSubmit={handleSubmit}
        isPending={createPlace.isPending}
      />
    </div>
  )
}
