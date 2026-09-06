"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Location01Icon, UserCircleIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Friend } from "@/services"
import { CompatibilityScore } from "./compatibility-score"
import { InterestBadge } from "./interest-badge"
import { SendMessageButton } from "./send-message-button"

function getInitials(firstName?: string | null, lastName?: string | null) {
  const first = firstName?.trim().charAt(0) ?? ""
  const last = lastName?.trim().charAt(0) ?? ""
  return (first + last).toUpperCase() || null
}

export function FriendCard({ friend }: { friend: Friend }) {
  const t = useTranslations("matching.card")
  const actions = useTranslations("matching.actions")

  const fullName =
    [friend.firstName, friend.lastName].filter(Boolean).join(" ") || t("noName")
  const initials = getInitials(friend.firstName, friend.lastName)
  const sharedIds = new Set(friend.sharedInterests.map((interest) => interest.id))
  const shownInterests = friend.interests.slice(0, 6)

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-4">
          <Avatar size="lg">
            {friend.avatarUrl && <AvatarImage src={friend.avatarUrl} alt={fullName} />}
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
              {friend.city ? friend.city.name : t("noCity")}
            </p>
            {friend.sameCity && (
              <Badge variant="secondary" className="w-fit rounded-full">
                {t("sameCity")}
              </Badge>
            )}
          </div>
        </div>

        <CompatibilityScore score={friend.compatibility} />

        {friend.bio && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{friend.bio}</p>
        )}

        {friend.interests.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("sharedCount", { count: friend.sharedInterests.length })}
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

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <SendMessageButton userId={friend.userId} />
          <Link
            href={`/profile/${friend.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {actions("viewProfile")}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}