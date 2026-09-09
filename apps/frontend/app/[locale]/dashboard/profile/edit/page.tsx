import { cookies } from "next/headers"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { redirect, Link } from "@/i18n/navigation"
import { Logo } from "@/components/common/logo"
import { buttonVariants } from "@/components/ui/button"
import { SESSION_COOKIE, type Session } from "@/lib/session"
import EditProfilePage from "@/components/profile/profile-edit"

export default async function ProfileEditRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("profile.edit")

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

      <header className="relative mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/dashboard/profile" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          {t("viewProfile")}
        </Link>
      </header>

      <main className="relative">
        <EditProfilePage />
      </main>
    </div>
  )
}
