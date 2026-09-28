"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldCheck } from "@hugeicons/core-free-icons"

import { useAuthStore } from "@/stores/auth-store"
import { Link } from "@/i18n/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardIdentity({ welcome, verified, admin }: { welcome: string; verified: string; admin: string }) {
  const session = useAuthStore((state) => state.session)
  const phoneNumber = session?.user.phoneNumber ?? ""
  const isAdmin = session?.user.role === "ADMIN"

  return (
    <section className="flex flex-col gap-6 pt-12 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar size="lg"><AvatarFallback className="bg-rose-100 text-rose-700">{phoneNumber.slice(-2) || "—"}</AvatarFallback></Avatar>
        <div className="flex flex-col gap-1"><p className="text-sm text-muted-foreground">{welcome}</p><h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{phoneNumber}</h1></div>
      </div>
      <div className="flex items-center gap-3">
        {isAdmin && <Link href="/dashboard/admin" className={buttonVariants({ variant: "default", size: "sm" })}><HugeiconsIcon icon={ShieldCheck} className="size-3.5" />{admin}</Link>}
        <Badge variant="secondary" className="w-fit rounded-full"><HugeiconsIcon icon={ShieldCheck} className="size-3.5" />{verified}</Badge>
      </div>
    </section>
  )
}

export function DashboardAdminCard({ title, description, action }: { title: string; description: string; action: string }) {
  const isAdmin = useAuthStore((state) => state.session?.user.role === "ADMIN")
  if (!isAdmin) return null
  return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><Button render={<Link href="/dashboard/admin" /> } variant="outline" size="sm">{action}</Button></CardContent></Card>
}
