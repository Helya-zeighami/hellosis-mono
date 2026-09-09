"use client"

import { useTranslations } from "next-intl"

export function GroupTypingIndicator({ names }: { names: string[] }) {
  const t = useTranslations("groupMessaging")

  if (names.length === 0) return null

  let label: string
  if (names.length === 1) {
    label = t("typing.single", { name: names[0] })
  } else if (names.length === 2) {
    label = t("typing.two", { first: names[0], second: names[1] })
  } else {
    label = t("typing.many", { count: names.length })
  }

  return (
    <div className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
      <span className="flex gap-0.5">
        <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="size-1 animate-bounce rounded-full bg-current" />
      </span>
      {label}
    </div>
  )
}