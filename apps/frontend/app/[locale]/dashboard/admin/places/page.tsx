import { getTranslations } from "next-intl/server";

import { AdminPlacesList } from "@/components/admin/admin-places-list";

export default async function AdminPlacesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  void locale;
  const t = await getTranslations("admin.places");

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <AdminPlacesList />
    </section>
  );
}