"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function EmptyMatchState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: IconSvgElement
  title: string
  description: string
  actionLabel: string
  actionHref: string
}) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon icon={icon} className="size-7 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Link href={actionHref} className={buttonVariants({ variant: "default", size: "sm" })}>
          {actionLabel}
        </Link>
      </CardContent>
    </Card>
  )
}
