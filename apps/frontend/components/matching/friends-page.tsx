"use client"

import { UserGroupIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { useFriends } from "@/hooks/use-matches"
import { EmptyMatchState } from "./empty-match-state"
import { FriendCard } from "./friend-card"
import { MatchSkeleton } from "./match-skeleton"

export function FriendsPage() {
  const t = useTranslations("friends")
  const { data: friends, isLoading, isError, refetch } = useFriends()

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-24">
        <MatchSkeleton count={6} />
      </div>
    )
  }

  if (isError || !friends) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-3 px-6 pb-24">
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {friends.length === 0 ? (
        <EmptyMatchState
          icon={UserGroupIcon}
          title={t("empty.title")}
          description={t("empty.description")}
          actionLabel={t("empty.action")}
          actionHref="/discover"
        />
      ) : (
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {friends.map((friend) => (
            <FriendCard key={friend.matchId} friend={friend} />
          ))}
        </div>
      )}
    </div>
  )
}