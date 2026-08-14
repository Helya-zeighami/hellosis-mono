"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useInterests } from "@/hooks/use-profile"

interface InterestSelectorProps {
  selectedIds: string[]
  pendingIds?: string[]
  onChange: (selectedIds: string[]) => void
  disabled?: boolean
}

export function InterestSelector({
  selectedIds,
  pendingIds = [],
  onChange,
  disabled = false,
}: InterestSelectorProps) {
  const t = useTranslations("profile.interests")

  const { data: interests, isLoading, isError, refetch } = useInterests()

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2" aria-busy="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-4xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
        <p>{t("error")}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          {t("retry")}
        </Button>
      </div>
    )
  }

  if (!interests || interests.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noAvailable")}</p>
  }

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t("label")}>
      {interests.map((interest) => {
        const selected = selectedIds.includes(interest.id)
        const pending = pendingIds.includes(interest.id)

        return (
          <Button
            key={interest.id}
            type="button"
            variant={selected ? "default" : "outline"}
            size="sm"
            onClick={() => toggle(interest.id)}
            disabled={disabled || pending}
            aria-pressed={selected}
            className={selected ? "pr-2.5" : undefined}
          >
            {pending ? (
              <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="animate-spin" />
            ) : selected ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
            ) : null}
            {interest.name}
          </Button>
        )
      })}
    </div>
  )
}
