"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/[.08] p-1 dark:border-white/[.145]">
      <span className="px-3 text-sm text-zinc-500">{t("label")}:</span>
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-colors",
            locale === l
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400",
          )}
        >
          {t(l)}
        </Link>
      ))}
    </div>
  );
}
