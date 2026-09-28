"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CompassIcon,
  MapPinIcon,
  Calendar01Icon,
  GroupIcon,
  ChatIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { useLocale, useTranslations } from "next-intl"

import { usePathname, Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

function isTabActive(rest: string, href: string) {
  if (href === "/dashboard") {
    return rest === "/dashboard"
  }
  return rest === href || rest.startsWith(`${href}/`)
}

export function BottomNav() {
  const t = useTranslations("bottomNav")
  const pathname = usePathname()
  const locale = useLocale()

  const prefix = `/${locale}`
  const rest = pathname.replace(prefix, "")

  const tabs = [
    { href: "/dashboard", label: t("discover"), icon: CompassIcon },
    { href: "/dashboard/places", label: t("places"), icon: MapPinIcon },
    { href: "/dashboard/events", label: t("events"), icon: Calendar01Icon },
    { href: "/dashboard/groups", label: t("groups"), icon: GroupIcon },
    { href: "/dashboard/messages", label: t("messages"), icon: ChatIcon },
    { href: "/dashboard/profile", label: t("profile"), icon: UserCircleIcon },
  ]

  return (
    <nav
      aria-label={t("label")}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 w-full border-t border-border/60",
        "bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70",
        "pb-[env(safe-area-inset-bottom)]",
        "shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.12)]",
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl items-stretch justify-between px-2">
        {tabs.map((tab) => {
          const active = isTabActive(rest, tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-8 items-center justify-center rounded-full px-3 transition-all duration-200",
                  active && "bg-primary/15",
                )}
              >
                <HugeiconsIcon icon={tab.icon} className="size-5" />
              </span>
              <span className="text-[10px] font-medium leading-none sm:text-xs">
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
