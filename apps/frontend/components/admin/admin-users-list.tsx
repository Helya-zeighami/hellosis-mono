"use client"

import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useAdminUsers, useUpdateUserRole } from "@/hooks/use-admin"
import type { AdminUser, UserRole } from "@/services"

function AdminUserRow({ user }: { user: AdminUser }) {
  const t = useTranslations("admin.users")
  const updateRole = useUpdateUserRole()

  const name =
    user.profile?.firstName && user.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.phoneNumber

  const handleToggle = () => {
    const nextRole: UserRole = user.role === "ADMIN" ? "USER" : "ADMIN"
    updateRole.mutate(
      { id: user.id, role: nextRole },
      {
        onSuccess: () => toast.success(t("toasts.updated")),
        onError: () => toast.error(t("errors.update")),
      },
    )
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate font-medium text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user.phoneNumber}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {user.role === "ADMIN" ? (
            <Badge>{t("role.admin")}</Badge>
          ) : (
            <Badge variant="secondary">{t("role.user")}</Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggle}
            disabled={updateRole.isPending}
          >
            {user.role === "ADMIN" ? t("revoke") : t("promote")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminUsersList() {
  const t = useTranslations("admin.users")
  const { data, isLoading, isError, refetch } = useAdminUsers()

  if (isLoading) {
    return (
      <div className="grid w-full gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col items-start gap-3 rounded-2xl bg-destructive/10 p-6 text-sm text-destructive">
        <p>{t("errors.load")}</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          {t("retry")}
        </Button>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-muted-foreground/20 px-6 py-16 text-center">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {t("empty.title")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("empty.description")}</p>
      </div>
    )
  }

  return (
    <div className="grid w-full gap-3">
      {data.map((user) => (
        <AdminUserRow key={user.id} user={user} />
      ))}
    </div>
  )
}