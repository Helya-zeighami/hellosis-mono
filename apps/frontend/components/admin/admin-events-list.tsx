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
  useAdminEvents,
  useApproveEvent,
  useRejectEvent,
} from "@/hooks/use-admin"
import type { AdminEventListItem } from "@/services"

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleString(locale === "fa" ? "fa-IR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function AdminEventCard({
  event,
  locale,
  onApprove,
  onReject,
}: {
  event: AdminEventListItem
  locale: string
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const t = useTranslations("admin.events")

  const creatorName =
    event.creator.profile?.firstName && event.creator.profile?.lastName
      ? `${event.creator.profile.firstName} ${event.creator.profile.lastName}`
      : event.creator.phoneNumber

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold text-foreground">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("by")} {creatorName}
          </p>
        </div>
        <Badge variant="secondary">{t("status.pending")}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{event.city?.name ?? t("noCity")}</span>
          <span>{formatDate(event.startTime, locale)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onApprove(event.id)}
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} />
            {t("approve")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onReject(event.id)}
          >
            <HugeiconsIcon icon={RemoveSquareIcon} />
            {t("reject")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminEventsList({ locale }: { locale: string }) {
  const t = useTranslations("admin.events")
  const { data, isLoading, isError, refetch } = useAdminEvents("PENDING")
  const approveMutation = useApproveEvent()
  const rejectMutation = useRejectEvent()

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
      {data.map((event) => (
        <AdminEventCard
          key={event.id}
          event={event}
          locale={locale}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  )
}