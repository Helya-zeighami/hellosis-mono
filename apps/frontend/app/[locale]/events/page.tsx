import { cookies } from "next/headers"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

import { redirect, Link } from "@/i18n/navigation"
import { Logo } from "@/components/common/logo"
import { buttonVariants } from "@/components/ui/button"
import { SESSION_COOKIE, type Session } from "@/lib/session"
import { EventsPage } from "@/components/events/events-page"

export default async function EventsRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("events")

  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  let session: Session | null = null
  if (raw) {
    try {
      session = JSON.parse(decodeURIComponent(raw)) as Session
    } catch {
      session = null
    }
  }

  if (!session) {
    redirect({ href: "/login", locale })
    throw new Error("unreachable")
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -end-40 size-[24rem] rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-500/10"
      />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/events/create"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <HugeiconsIcon icon={PlusSignIcon} />
            {t("createEvent")}
          </Link>
        </div>
      </header>

      <main className="relative">
        <EventsPage />
      </main>
    </div>
  )
}
