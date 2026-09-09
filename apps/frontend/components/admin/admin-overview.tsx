"use client"

import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminEvents, useAdminPlaces } from "@/hooks/use-admin"

export function AdminOverview() {
  const t = useTranslations("admin.overview")

  const events = useAdminEvents("PENDING")
  const places = useAdminPlaces("PENDING")

  const eventCount = events.data?.length ?? 0
  const placeCount = places.data?.length ?? 0

  const loading = events.isLoading || places.isLoading

  if (loading) {
    return (
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("events.title")}</CardTitle>
          <CardDescription>{t("events.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="font-heading text-4xl font-bold text-foreground">
            {eventCount}
          </p>
          <Link
            href="/dashboard/admin/events"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("events.action")}
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("places.title")}</CardTitle>
          <CardDescription>{t("places.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="font-heading text-4xl font-bold text-foreground">
            {placeCount}
          </p>
          <Link
            href="/dashboard/admin/places"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("places.action")}
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}