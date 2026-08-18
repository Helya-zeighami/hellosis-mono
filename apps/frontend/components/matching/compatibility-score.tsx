"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { useTranslations } from "next-intl"

import { ProgressIndicator, ProgressTrack } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type Tone = "high" | "medium" | "low"

function scoreTone(score: number): Tone {
  if (score >= 70) return "high"
  if (score >= 40) return "medium"
  return "low"
}

const indicatorClasses: Record<Tone, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-rose-500",
}

const valueClasses: Record<Tone, string> = {
  high: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-rose-600 dark:text-rose-400",
}

export function CompatibilityScore({ score }: { score: number }) {
  const t = useTranslations("matching.compatibility")
  const tone = scoreTone(score)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{t("label")}</span>
        <span className={cn("text-sm font-semibold tabular-nums", valueClasses[tone])}>
          {score}%
        </span>
      </div>
      <ProgressPrimitive.Root value={score} className="w-full">
        <ProgressTrack className="h-2">
          <ProgressIndicator className={indicatorClasses[tone]} />
        </ProgressTrack>
      </ProgressPrimitive.Root>
    </div>
  )
}
