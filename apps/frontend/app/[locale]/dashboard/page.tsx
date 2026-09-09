import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldCheck } from "@hugeicons/core-free-icons";

import { redirect } from "@/i18n/navigation";
import { Logo } from "@/components/common/logo";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SESSION_COOKIE, type Session } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import LogoutButton from "./logout-button";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  let session: Session | null = null;
  if (raw) {
    try {
      session = JSON.parse(decodeURIComponent(raw)) as Session;
    } catch {
      session = null;
    }
  }

  if (!session) {
    redirect({ href: "/login", locale });
    throw new Error("unreachable");
  }

  const isAdmin = session.user.role === "ADMIN";

  const links = [
    {
      href: "/dashboard/profile",
      title: t("cards.profile.title"),
      description: t("cards.profile.description"),
      action: t("cards.profile.action"),
    },
    {
      href: "/dashboard/discover",
      title: t("cards.discover.title"),
      description: t("cards.discover.description"),
      action: t("cards.discover.action"),
    },
    {
      href: "/dashboard/places",
      title: t("cards.places.title"),
      description: t("cards.places.description"),
      action: t("cards.places.action"),
    },
    {
      href: "/dashboard/events",
      title: t("cards.events.title"),
      description: t("cards.events.description"),
      action: t("cards.events.action"),
    },
    {
      href: "/dashboard/groups",
      title: t("cards.groups.title"),
      description: t("cards.groups.description"),
      action: t("cards.groups.action"),
    },
    {
      href: "/dashboard/messages",
      title: t("cards.messages.title"),
      description: t("cards.messages.description"),
      action: t("cards.messages.action"),
    },
    {
      href: "/dashboard/matches",
      title: t("cards.matches.title"),
      description: t("cards.matches.description"),
      action: t("cards.matches.action"),
    },
    {
      href: "/dashboard/friends",
      title: t("cards.friends.title"),
      description: t("cards.friends.description"),
      action: t("cards.friends.action"),
    },
  ];

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
          <LogoutButton label={t("logout")} />
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-24">
        <section className="flex flex-col gap-6 pt-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className="bg-rose-100 text-rose-700">
                {session.user.phoneNumber.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{t("welcome")}</p>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {session.user.phoneNumber}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                <HugeiconsIcon icon={ShieldCheck} className="size-3.5" />
                {t("admin")}
              </Link>
            )}
            <Badge variant="secondary" className="w-fit rounded-full">
              <HugeiconsIcon icon={ShieldCheck} className="size-3.5" />
              {t("verified")}
            </Badge>
          </div>
        </section>

        <section className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Card key={link.href}>
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={link.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {link.action}
                </Link>
              </CardContent>
            </Card>
          ))}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>{t("cards.admin.title")}</CardTitle>
                <CardDescription>
                  {t("cards.admin.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/dashboard/admin"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {t("cards.admin.action")}
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}