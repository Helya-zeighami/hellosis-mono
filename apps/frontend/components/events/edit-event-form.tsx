"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useEvent, useUpdateEvent } from "@/hooks/use-events"
import { EventForm } from "./event-form"
import { EventSkeleton } from "./event-skeleton"

interface EditEventFormProps {
  eventId: string
}

export function EditEventForm({ eventId }: EditEventFormProps) {
  const t = useTranslations("events")
  const router = useRouter()
  const { data: event, isLoading, isError } = useEvent(eventId)
  const updateEvent = useUpdateEvent(eventId)

  const handleSubmit = (data: {
    title: string
    description: string
    cityId: string
    startTime: string
    endTime?: string
  }) => {
    updateEvent.mutate(data, {
      onSuccess: () => {
        toast.success(t("toasts.updated"))
        router.push(`/dashboard/events/${eventId}`)
      },
      onError: () => {
        toast.error(t("errors.update"))
      },
    })
  }

  if (isLoading) return <EventSkeleton />
  if (isError || !event) return null

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
      <EventForm
        mode="edit"
        initialTitle={event.title}
        initialDescription={event.description}
        initialStartTime={event.startTime}
        initialEndTime={event.endTime ?? ""}
        initialCity={event.city}
        onSubmit={handleSubmit}
        isPending={updateEvent.isPending}
      />
    </div>
  )
}
