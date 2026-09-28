import { setRequestLocale, getTranslations } from "next-intl/server"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { Link } from "@/i18n/navigation"
import { Logo } from "@/components/common/logo"
import { buttonVariants } from "@/components/ui/button"
import { CreateGroupForm } from "@/components/groups/create-group-form"

export default async function CreateGroupRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("groups")

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
        <Link
          href="/dashboard/groups"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          {t("backToGroups")}
        </Link>
      </header>

      <main className="relative">
        <CreateGroupForm />
      </main>
    </div>
  )
}
