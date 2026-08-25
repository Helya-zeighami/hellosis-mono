"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Delete01Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { EventHeader } from "./event-header"
import { EventReactions } from "./event-reactions"
import { EventComments } from "./event-comments"
import { EventSkeleton } from "./event-skeleton"
import { useEvent, useDeleteEvent } from "@/hooks/use-events"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface EventDetailPageProps {
  eventId: string
}

export function EventDetailPage({ eventId }: EventDetailPageProps) {
  const t = useTranslations("events.detail")
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const currentUserId = session?.user.id ?? ""

  const { data: event, isLoading, isError, refetch } = useEvent(eventId)
  const deleteEvent = useDeleteEvent()

  if (isLoading) return <EventSkeleton />

  if (isError || !event) {
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

  const isCreator = event.creatorId === currentUserId

  const handleDelete = () => {
    deleteEvent.mutate(eventId, {
      onSuccess: () => {
        toast.success(t("toasts.deleted"))
        router.push("/events")
      },
      onError: () => {
        toast.error(t("errors.delete"))
      },
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-24 pt-8">
      <EventHeader event={event} currentUserId={currentUserId} />

      <div className="flex items-center gap-3">
        <EventReactions
          eventId={eventId}
          counts={event._count}
        />
        {isCreator && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteEvent.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            {deleteEvent.isPending && (
              <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
            )}
            {!deleteEvent.isPending && (
              <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
            )}
            {t("delete")}
          </button>
        )}
      </div>

      <EventComments eventId={eventId} />
    </div>
  )
}
