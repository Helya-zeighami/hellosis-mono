import { cookies } from "next/headers"
import { setRequestLocale } from "next-intl/server"

import { redirect, Link } from "@/i18n/navigation"
import { Logo } from "@/components/common/logo"
import { SESSION_COOKIE, type Session } from "@/lib/session"
import { ConversationPage } from "@/components/messaging/conversation-page"

export default async function ConversationRoute({
  params,
}: {
  params: Promise<{ locale: string; conversationId: string }>
}) {
  const { locale, conversationId } = await params
  setRequestLocale(locale)

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

      <header className="relative mx-auto hidden w-full max-w-5xl items-center justify-between px-6 py-5 md:flex">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="relative mt-2 pb-6 md:mt-0 md:pb-12">
        <ConversationPage conversationId={conversationId} />
      </main>
    </div>
  )
}