"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Message02Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { MessagingShell } from "./messages-shell"

export function MessagesPage() {
  const t = useTranslations("messaging")

  return (
    <MessagingShell>
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon icon={Message02Icon} className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t("selectConversation")}</p>
        </div>
      </div>
    </MessagingShell>
  )
}