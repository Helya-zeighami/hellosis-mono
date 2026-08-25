"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useCreateEvent } from "@/hooks/use-events"
import { EventForm } from "./event-form"

export function CreateEventForm() {
  const t = useTranslations("events")
  const router = useRouter()
  const createEvent = useCreateEvent()

  const handleSubmit = (data: {
    title: string
    description: string
    cityId: string
    startTime: string
    endTime?: string
  }) => {
    createEvent.mutate(data, {
      onSuccess: (res) => {
        toast.success(t("toasts.created"))
        router.push(`/events/${res.data?.id}`)
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
      <EventForm
        mode="create"
        onSubmit={handleSubmit}
        isPending={createEvent.isPending}
      />
    </div>
  )
}
