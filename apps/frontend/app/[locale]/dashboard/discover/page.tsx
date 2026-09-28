import { getTranslations, setRequestLocale } from "next-intl/server"
import { HugeiconsIcon } from "@hugeicons/react"
import { InboxIcon } from "@hugeicons/core-free-icons"

import { Link } from "@/i18n/navigation"
import { Logo } from "@/components/common/logo"
import { buttonVariants } from "@/components/ui/button"
import { DiscoverPage } from "@/components/matching/discover-page"

export default async function DiscoverRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("discover")

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
            href="/dashboard/matches"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <HugeiconsIcon icon={InboxIcon} />
            {t("requestsLink")}
          </Link>
        </div>
      </header>

      <main className="relative">
        <DiscoverPage />
      </main>
    </div>
  )
}
