"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Delete01Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  useEventComments,
  useCreateEventComment,
  useDeleteEventComment,
} from "@/hooks/use-events"
import { useAuthStore } from "@/stores/auth-store"

interface EventCommentsProps {
  eventId: string
}

export function EventComments({ eventId }: EventCommentsProps) {
  const t = useTranslations("events.comments")
  const session = useAuthStore((s) => s.session)
  const currentUserId = session?.user.id ?? ""
  const [content, setContent] = useState("")

  const { data: comments, isLoading } = useEventComments(eventId)
  const createComment = useCreateEventComment(eventId)
  const deleteComment = useDeleteEventComment(eventId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    createComment.mutate(content.trim(), {
      onSuccess: () => setContent(""),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {t("title", { count: comments?.length ?? 0 })}
      </h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("placeholder")}
          rows={2}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!content.trim() || createComment.isPending}
          className="self-end"
        >
          {createComment.isPending && (
            <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
          )}
          {t("submit")}
        </Button>
      </form>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && comments && comments.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      )}

      {!isLoading && comments && comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => {
            const name =
              comment.user.profile?.firstName ?? t("unknownUser")
            const initials = name.slice(0, 2).toUpperCase()

            return (
              <div
                key={comment.id}
                className="flex gap-3 rounded-xl border px-3 py-2"
              >
                <Avatar size="sm">
                  {comment.user.profile?.avatarUrl && (
                    <AvatarImage
                      src={comment.user.profile.avatarUrl}
                      alt={name}
                    />
                  )}
                  <AvatarFallback className="bg-rose-100 text-rose-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {name}
                    </span>
                    {comment.userId === currentUserId && (
                      <button
                        type="button"
                        onClick={() => deleteComment.mutate(comment.id)}
                        disabled={deleteComment.isPending}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comment.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
