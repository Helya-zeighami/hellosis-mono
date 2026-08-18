"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Location01Icon,
  Loading03Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { MatchRequest } from "@/services"
import { useApiErrorMessage } from "@/hooks/use-api-error"
import { useAcceptMatch, useRejectMatch } from "@/hooks/use-matches"
import { CompatibilityScore } from "./compatibility-score"
import { InterestBadge } from "./interest-badge"

function getInitials(firstName?: string | null, lastName?: string | null) {
  const first = firstName?.trim().charAt(0) ?? ""
  const last = lastName?.trim().charAt(0) ?? ""
  return (first + last).toUpperCase() || null
}

export function MatchRequestCard({ request }: { request: MatchRequest }) {
  const t = useTranslations("matching.requests")
  const format = useFormatter()
  const getErrorMessage = useApiErrorMessage()
  const accept = useAcceptMatch()
  const reject = useRejectMatch()

  const sender = request.sender
  const fullName =
    [sender.firstName, sender.lastName].filter(Boolean).join(" ") || t("noName")
  const initials = getInitials(sender.firstName, sender.lastName)
  const isPending = accept.isPending || reject.isPending

  const handleAccept = () => {
    accept.mutate(request.id, {
      onSuccess: () => toast.success(t("accepted")),
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  const handleReject = () => {
    reject.mutate(request.id, {
      onSuccess: () => toast.success(t("rejected")),
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-4">
          <Avatar size="lg">
            {sender.avatarUrl && <AvatarImage src={sender.avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-rose-100 text-rose-700">
              {initials ? (
                initials
              ) : (
                <HugeiconsIcon icon={UserCircleIcon} className="size-5" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              {fullName}
            </h3>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Location01Icon} className="size-4" />
              {sender.city ? sender.city.name : t("noCity")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("receivedAt", {
                time: format.relativeTime(new Date(request.createdAt)),
              })}
            </p>
          </div>
        </div>

        <CompatibilityScore score={sender.compatibility} />

        {sender.sharedInterests.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("sharedCount", { count: sender.sharedInterests.length })}
            </p>
            <div className="flex flex-wrap gap-2">
              {sender.sharedInterests.map((interest) => (
                <InterestBadge key={interest.id} name={interest.name} shared />
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <Button size="sm" onClick={handleAccept} disabled={isPending}>
            {accept.isPending ? (
              <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
            ) : (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} />
            )}
            {t("accept")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isPending}
          >
            {reject.isPending ? (
              <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
            ) : (
              <HugeiconsIcon icon={Cancel01Icon} />
            )}
            {t("reject")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
