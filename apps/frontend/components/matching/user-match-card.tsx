"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Location01Icon, UserCircleIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Recommendation } from "@/services"
import { CompatibilityScore } from "./compatibility-score"
import { InterestBadge } from "./interest-badge"
import { MatchActions } from "./match-actions"

function getInitials(firstName?: string | null, lastName?: string | null) {
  const first = firstName?.trim().charAt(0) ?? ""
  const last = lastName?.trim().charAt(0) ?? ""
  return (first + last).toUpperCase() || null
}

export function UserMatchCard({
  user,
  onSent,
}: {
  user: Recommendation
  onSent?: (userId: string) => void
}) {
  const t = useTranslations("matching.card")

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || t("noName")
  const initials = getInitials(user.firstName, user.lastName)
  const sharedIds = new Set(user.sharedInterests.map((interest) => interest.id))
  const shownInterests = user.interests.slice(0, 6)

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-4">
          <Avatar size="lg">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={fullName} />}
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
              {user.city ? user.city.name : t("noCity")}
            </p>
            {user.sameCity && (
              <Badge variant="secondary" className="w-fit rounded-full">
                {t("sameCity")}
              </Badge>
            )}
          </div>
        </div>

        <CompatibilityScore score={user.compatibility} />

        {user.bio && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>
        )}

        {user.interests.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("sharedCount", { count: user.sharedInterests.length })}
            </p>
            <div className="flex flex-wrap gap-2">
              {shownInterests.map((interest) => (
                <InterestBadge
                  key={interest.id}
                  name={interest.name}
                  shared={sharedIds.has(interest.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-1">
          <MatchActions userId={user.userId} profileId={user.id} onSent={onSent} />
        </div>
      </CardContent>
    </Card>
  )
}
