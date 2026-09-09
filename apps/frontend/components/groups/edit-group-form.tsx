"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useGroup, useUpdateGroup } from "@/hooks/use-groups"
import { GroupForm } from "./group-form"
import { GroupSkeleton } from "./group-skeleton"

interface EditGroupFormProps {
  groupId: string
}

export function EditGroupForm({ groupId }: EditGroupFormProps) {
  const t = useTranslations("groups")
  const router = useRouter()
  const { data: group, isLoading, isError } = useGroup(groupId)
  const updateGroup = useUpdateGroup(groupId)

  const handleSubmit = (data: {
    name: string
    description?: string
    imageUrl?: string
    cityId?: string
  }) => {
    updateGroup.mutate(data, {
      onSuccess: () => {
        toast.success(t("toasts.updated"))
        router.push(`/dashboard/groups/${groupId}`)
      },
      onError: () => {
        toast.error(t("errors.update"))
      },
    })
  }

  if (isLoading) return <GroupSkeleton />
  if (isError || !group) return null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-24 pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("editPage.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("editPage.description")}
        </p>
      </div>
      <GroupForm
        mode="edit"
        initialName={group.name}
        initialDescription={group.description ?? ""}
        initialImageUrl={group.imageUrl ?? ""}
        initialCity={group.city}
        onSubmit={handleSubmit}
        isPending={updateGroup.isPending}
      />
    </div>
  )
}
