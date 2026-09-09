"use client"

import { InboxIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { useMatchRequests } from "@/hooks/use-matches"
import { EmptyMatchState } from "./empty-match-state"
import { MatchRequestCard } from "./match-request-card"
import { MatchSkeleton } from "./match-skeleton"

export function MatchesPage() {
  const t = useTranslations("matches")
  const { data: requests, isLoading, isError, refetch } = useMatchRequests()

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-24">
        <MatchSkeleton count={2} />
      </div>
    )
  }

  if (isError || !requests) {
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {requests.length === 0 ? (
        <EmptyMatchState
          icon={InboxIcon}
          title={t("empty.title")}
          description={t("empty.description")}
          actionLabel={t("empty.action")}
          actionHref="/dashboard/discover"
        />
      ) : (
        <div className="grid w-full gap-4">
          {requests.map((request) => (
            <MatchRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}
