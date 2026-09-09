"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, RemoveSquareIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useAdminPlaces,
  useApprovePlace,
  useRejectPlace,
} from "@/hooks/use-admin"
import type { AdminPlaceListItem } from "@/services"

function AdminPlaceCard({
  place,
  onApprove,
  onReject,
}: {
  place: AdminPlaceListItem
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const t = useTranslations("admin.places")

  const creatorName =
    place.createdBy?.profile?.firstName && place.createdBy?.profile?.lastName
      ? `${place.createdBy.profile.firstName} ${place.createdBy.profile.lastName}`
      : place.createdBy?.phoneNumber ?? t("unknown")

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold text-foreground">
            {place.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("by")} {creatorName}
          </p>
        </div>
        <Badge variant="secondary">{t("status.pending")}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {place.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {place.description}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{place.city?.name ?? t("noCity")}</span>
          <span>{place.category?.name ?? t("noCategory")}</span>
          {place.address && <span className="truncate">{place.address}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => onApprove(place.id)}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} />
            {t("approve")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onReject(place.id)}
          >
            <HugeiconsIcon icon={RemoveSquareIcon} />
            {t("reject")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminPlacesList() {
  const t = useTranslations("admin.places")
  const { data, isLoading, isError, refetch } = useAdminPlaces("PENDING")
  const approveMutation = useApprovePlace()
  const rejectMutation = useRejectPlace()

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success(t("toasts.approved")),
      onError: () => toast.error(t("errors.action")),
    })
  }

  const handleReject = (id: string) => {
    rejectMutation.mutate(id, {
      onSuccess: () => toast.success(t("toasts.rejected")),
      onError: () => toast.error(t("errors.action")),
    })
  }

  if (isLoading) {
    return (
      <div className="grid w-full gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col items-start gap-3 rounded-2xl bg-destructive/10 p-6 text-sm text-destructive">
        <p>{t("errors.load")}</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          {t("retry")}
        </Button>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-muted-foreground/20 px-6 py-16 text-center">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {t("empty.title")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("empty.description")}</p>
      </div>
    )
  }

  return (
    <div className="grid w-full gap-4">
      {data.map((place) => (
        <AdminPlaceCard
          key={place.id}
          place={place}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  )
}