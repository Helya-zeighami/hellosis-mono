"use client"

import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { GroupHeader } from "./group-header"
import { GroupMembers } from "./group-members"
import { JoinButton } from "./join-button"
import { GroupSkeleton } from "./group-skeleton"
import { useGroup } from "@/hooks/use-groups"
import { useAuthStore } from "@/stores/auth-store"

interface GroupDetailPageProps {
  groupId: string
}

export function GroupDetailPage({ groupId }: GroupDetailPageProps) {
  const t = useTranslations("groups.detail")
  const session = useAuthStore((s) => s.session)
  const currentUserId = session?.user.id ?? ""

  const { data: group, isLoading, isError, refetch } = useGroup(groupId)

  if (isLoading) {
    return <GroupSkeleton />
  }

  if (isError || !group) {
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-24">
      <GroupHeader group={group} currentUserId={currentUserId} />

      <div className="flex flex-col gap-3">
        <JoinButton
          groupId={groupId}
          currentUserId={currentUserId}
          members={group.members}
        />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {t("membersTitle", { count: group.members.length })}
        </h2>
        <GroupMembers members={group.members} />
      </section>
    </div>
  )
}
