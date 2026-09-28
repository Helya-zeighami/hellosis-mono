"use client"

import { useLocale, useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon } from "@hugeicons/core-free-icons"

import { usePathname, Link } from "@/i18n/navigation"
import { Logo } from "@/components/common/logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function isIsolatedRoute(rest: string) {
  const isConversation = /^\/dashboard\/messages\/[^/]+$/.test(rest)
  const isGroupChat = /^\/dashboard\/groups\/[^/]+\/chat$/.test(rest)
  return isConversation || isGroupChat
}

export function AppBar() {
  const t = useTranslations("bottomNav")
  const pathname = usePathname()
  const locale = useLocale()

  const rest = pathname.replace(`/${locale}`, "")

  if (rest.startsWith("/dashboard/admin") || isIsolatedRoute(rest)) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/dashboard" aria-label={t("label")}>
          <Logo textClassName="text-lg" />
        </Link>
        <Link href="/dashboard/profile" aria-label={t("profile")}>
          <Avatar size="sm">
            <AvatarFallback className="bg-rose-100 text-rose-700">
              <HugeiconsIcon icon={UserCircleIcon} className="size-4" />
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}