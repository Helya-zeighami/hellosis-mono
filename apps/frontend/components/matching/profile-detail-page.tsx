"use client"

import { useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar02Icon, Location01Icon, UserCircleIcon } from "@hugeicons/core-free-icons"
import { useFormatter, useTranslations } from "next-intl"

import { useRouter } from "@/i18n/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfile } from "@/hooks/use-profile"
import { usePublicProfile } from "@/hooks/use-matches"
import { CompatibilityScore } from "./compatibility-score"
import { InterestBadge } from "./interest-badge"
import { MatchActions } from "./match-actions"

function getInitials(firstName?: string | null, lastName?: string | null) {
  const first = firstName?.trim().charAt(0) ?? ""
  const last = lastName?.trim().charAt(0) ?? ""
  return (first + last).toUpperCase() || null
}

export function ProfileDetailPage({ profileId }: { profileId: string }) {
  const t = useTranslations("profile.detail")
  const format = useFormatter()
  const router = useRouter()
  const { data: ownProfile } = useProfile()
  const { data: profile, isLoading, isError, refetch } = usePublicProfile(profileId)

  useEffect(() => {
    if (ownProfile && ownProfile.id === profileId) {
      router.replace("/profile")
    }
  }, [ownProfile, profileId, router])

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-24">
        <Card>
          <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />
            <div className="flex w-full flex-col gap-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-56" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-6 pb-24">
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

  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || t("noName")
  const initials = getInitials(profile.firstName, profile.lastName)
  const birthDate = profile.birthDate
    ? format.dateTime(new Date(profile.birthDate), { dateStyle: "long" })
    : null
  const city = profile.city ? profile.city.name : null
  const sharedIds = new Set(profile.sharedInterests.map((interest) => interest.id))
  const isOwnProfile = ownProfile?.id === profileId

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-24">
      <Card>
        <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar size="default" className="size-20 shrink-0 sm:size-24">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-rose-100 text-rose-700">
              {initials ? (
                initials
              ) : (
                <HugeiconsIcon icon={UserCircleIcon} className="size-10" />
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex w-full flex-col gap-4 text-center sm:text-start">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                {fullName}
              </h1>
              {profile.sameCity && (
                <Badge variant="secondary" className="w-fit rounded-full">
                  {t("sameCity")}
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-2 text-sm">
              {birthDate && (
                <span className="inline-flex items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                  <HugeiconsIcon icon={Calendar02Icon} className="size-4" />
                  {birthDate}
                </span>
              )}
              {city && (
                <span className="inline-flex items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                  <HugeiconsIcon icon={Location01Icon} className="size-4" />
                  {city}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{t("about")}</span>
              <p className="text-foreground">{profile.bio || t("noBio")}</p>
            </div>

            <div className="mx-auto w-full max-w-md sm:mx-0">
              <CompatibilityScore score={profile.compatibility} />
            </div>

            {!isOwnProfile && (
              <MatchActions
                userId={profile.userId}
                profileId={profile.id}
                status={profile.matchStatus}
                showViewProfile={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <h2 className="font-heading text-base font-medium">{t("interestsTitle")}</h2>
          {profile.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <InterestBadge
                  key={interest.id}
                  name={interest.name}
                  shared={sharedIds.has(interest.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noInterests")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
