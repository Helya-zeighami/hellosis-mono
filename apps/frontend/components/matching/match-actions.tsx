"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  EyeIcon,
  HeartAddIcon,
  HeartIcon,
  Loading03Icon,
  Link02Icon,
} from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Link } from "@/i18n/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { useApiErrorMessage } from "@/hooks/use-api-error"
import { useSendMatchRequest } from "@/hooks/use-matches"
import type { MatchRelationship } from "@/services"

export function MatchActions({
  userId,
  profileId,
  onSent,
  showViewProfile = true,
  status = null,
}: {
  userId: string
  profileId: string
  onSent?: (userId: string) => void
  showViewProfile?: boolean
  status?: MatchRelationship
}) {
  const t = useTranslations("matching.actions")
  const getErrorMessage = useApiErrorMessage()
  const { mutate, isPending } = useSendMatchRequest()

  const handleSend = () => {
    mutate(userId, {
      onSuccess: () => {
        toast.success(t("sent"))
        onSent?.(userId)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  if (status === "SENT") {
    return (
      <Button size="sm" disabled>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} />
        {t("sentLabel")}
      </Button>
    )
  }

  if (status === "ACCEPTED") {
    return (
      <Button size="sm" disabled>
        <HugeiconsIcon icon={HeartIcon} />
        {t("matchedLabel")}
      </Button>
    )
  }

  if (status === "RECEIVED") {
    return (
      <Link
        href="/matches"
        className={buttonVariants({ variant: "default", size: "sm" })}
      >
        <HugeiconsIcon icon={Link02Icon} />
        {t("respond")}
      </Link>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={handleSend} disabled={isPending}>
        {isPending ? (
          <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
        ) : (
          <HugeiconsIcon icon={HeartAddIcon} />
        )}
        {t("send")}
      </Button>
      {showViewProfile && (
        <Link
          href={`/profile/${profileId}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <HugeiconsIcon icon={EyeIcon} />
          {t("viewProfile")}
        </Link>
      )}
    </div>
  )
}
