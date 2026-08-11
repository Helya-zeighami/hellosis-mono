import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar02Icon,
  Chat01Icon,
  ShieldCheck,
  StoreLocationIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/common/logo";
import { VerifiedBadge } from "@/components/common/verified-badge";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import LocaleSwitcher from "@/components/locale-switcher";

const features = [
  { key: "groups", icon: UserGroupIcon },
  { key: "chats", icon: Chat01Icon },
  { key: "events", icon: Calendar02Icon },
  { key: "places", icon: StoreLocationIcon },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -end-40 size-[28rem] rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -start-40 size-96 rounded-full bg-amber-100/60 blur-3xl dark:bg-amber-400/5"
      />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/signup"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            {t("createAccount")}
          </Link>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-24">
        <section className="flex flex-col items-center gap-6 pt-16 text-center sm:pt-24">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {t("badge")}
          </Badge>

          <h1 className="max-w-2xl font-heading text-4xl font-bold tracking-tight text-balance text-foreground sm:text-6xl">
            {t("heading")}
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t("subheading")}
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              {t("createAccount")}
            </Link>
            <Link
              href="/groups"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {t("explore")}
            </Link>
          </div>

          <div className="mt-4 flex flex-col items-center gap-4">
            <VerifiedBadge label={t("trust")} className="rounded-full" />
            <div className="flex items-center gap-3">
              <AvatarGroup>
                <Avatar size="sm">
                  <AvatarFallback className="bg-rose-100 text-rose-700">
                    AR
                  </AvatarFallback>
                </Avatar>
                <Avatar size="sm">
                  <AvatarFallback className="bg-amber-100 text-amber-700">
                    SM
                  </AvatarFallback>
                </Avatar>
                <Avatar size="sm">
                  <AvatarFallback className="bg-sky-100 text-sky-700">
                    NL
                  </AvatarFallback>
                </Avatar>
                <Avatar size="sm">
                  <AvatarFallback className="bg-violet-100 text-violet-700">
                    KJ
                  </AvatarFallback>
                </Avatar>
                <AvatarGroupCount>+2k</AvatarGroupCount>
              </AvatarGroup>
              <p className="text-sm text-muted-foreground">
                {t("trustDetail")}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-24 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ key, icon }) => (
            <Card key={key} className="transition-colors hover:border-ring/40">
              <CardContent className="flex h-full flex-col gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
                  <HugeiconsIcon icon={icon} className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">
                    {t(`features.${key}.title`)}
                  </CardTitle>
                  <CardDescription>
                    {t(`features.${key}.description`)}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-24 flex w-full flex-col items-center gap-6 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success">
            <HugeiconsIcon icon={ShieldCheck} className="size-6" />
          </span>
          <h2 className="max-w-lg font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("safety.title")}
          </h2>
          <p className="max-w-xl text-muted-foreground">
            {t("safety.description")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {t.raw("safety.points").map((point: string) => (
              <Badge key={point} variant="secondary" className="rounded-full">
                {point}
              </Badge>
            ))}
          </div>
        </section>

        <section className="mt-24 flex w-full flex-col items-center gap-6 rounded-4xl bg-gradient-to-br from-rose-500 to-rose-700 px-8 py-16 text-center text-primary-foreground">
          <h2 className="max-w-lg font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("join.title")}
          </h2>
          <p className="max-w-xl text-primary-foreground/80">
            {t("join.description")}
          </p>
          <Link
            href="/signup"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
            })}
          >
            {t("join.cta")}
          </Link>
        </section>
      </main>

      <footer className="relative border-t bg-muted/40 py-8 text-center text-sm text-muted-foreground">
        {t("footer")}
      </footer>
    </div>
  );
}
