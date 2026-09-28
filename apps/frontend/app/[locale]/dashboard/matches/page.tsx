import { getTranslations, setRequestLocale } from "next-intl/server"
import { HugeiconsIcon } from "@hugeicons/react"
import { CompassIcon } from "@hugeicons/core-free-icons"

import { Link } from "@/i18n/navigation"
import { Logo } from "@/components/common/logo"
import { buttonVariants } from "@/components/ui/button"
import { MatchesPage } from "@/components/matching/matches-page"

export default async function MatchesRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("matches")

  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -end-40 size-[24rem] rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-500/10"
      />

      <header className="relative mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/discover"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <HugeiconsIcon icon={CompassIcon} />
            {t("discoverLink")}
          </Link>
        </div>
      </header>

      <main className="relative">
        <MatchesPage />
      </main>
    </div>
  )
}
