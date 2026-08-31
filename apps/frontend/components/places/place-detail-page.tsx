"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { buttonVariants } from "@/components/ui/button"
import { PlaceHeader } from "./place-header"
import { DeletePlaceDialog } from "./delete-place-dialog"
import { PlaceSkeleton } from "./place-skeleton"
import { usePlace, useDeletePlace } from "@/hooks/use-places"
import { useAuthStore } from "@/stores/auth-store"

interface PlaceDetailPageProps {
  placeId: string
}

export function PlaceDetailPage({ placeId }: PlaceDetailPageProps) {
  const t = useTranslations("places.detail")
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const currentUserId = session?.user.id ?? ""

  const {
    data: place,
    isLoading,
    isError,
    refetch,
  } = usePlace(placeId)
  const deletePlace = useDeletePlace()

  if (isLoading) return <PlaceSkeleton />

  if (isError || !place) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-6 pb-24 pt-8">
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
      </div>
    )
  }

  const isCreator = place.createdById === currentUserId

  const handleDelete = () => {
    deletePlace.mutate(placeId, {
      onSuccess: () => {
        toast.success(t("toasts.deleted"))
        router.push("/places")
      },
      onError: () => {
        toast.error(t("errors.delete"))
      },
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-24 pt-8">
      <PlaceHeader place={place} currentUserId={currentUserId} />

      {isCreator && (
        <div className="flex items-center gap-3">
          <DeletePlaceDialog
            isPending={deletePlace.isPending}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
