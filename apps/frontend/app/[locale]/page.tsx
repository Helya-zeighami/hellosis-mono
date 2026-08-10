import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/locale-switcher";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 bg-white dark:bg-black sm:items-start">
        <LocaleSwitcher />
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          {t("heading")}
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {t("subheading")}
        </p>
      </main>
    </div>
  );
}
