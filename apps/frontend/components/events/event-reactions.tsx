"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ThumbsUpIcon, ThumbsDownIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { useToggleLike, useToggleDislike } from "@/hooks/use-events"
import type { EventCounts } from "@/services"

interface EventReactionsProps {
  eventId: string
  counts: EventCounts
}

export function EventReactions({ eventId, counts }: EventReactionsProps) {
  const likeMutation = useToggleLike(eventId)
  const dislikeMutation = useToggleDislike(eventId)

  const [userLiked, setUserLiked] = useState(false)
  const [userDisliked, setUserDisliked] = useState(false)

  const handleLike = () => {
    likeMutation.mutate(undefined, {
      onSuccess: (res) => {
        setUserLiked(res.data?.liked ?? false)
        if (res.data?.liked) setUserDisliked(false)
      },
    })
  }

  const handleDislike = () => {
    dislikeMutation.mutate(undefined, {
      onSuccess: (res) => {
        setUserDisliked(res.data?.disliked ?? false)
        if (res.data?.disliked) setUserLiked(false)
      },
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userLiked ? "default" : "outline"}
        size="sm"
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className="gap-1.5"
      >
        <HugeiconsIcon icon={ThumbsUpIcon} className="size-4" />
        {counts.likes}
      </Button>
      <Button
        variant={userDisliked ? "default" : "outline"}
        size="sm"
        onClick={handleDislike}
        disabled={dislikeMutation.isPending}
        className="gap-1.5"
      >
        <HugeiconsIcon icon={ThumbsDownIcon} className="size-4" />
        {counts.dislikes}
      </Button>
    </div>
  )
}
