"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Delete01Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DeletePlaceDialogProps {
  isPending: boolean
  onDelete: () => void
}

export function DeletePlaceDialog({
  isPending,
  onDelete,
}: DeletePlaceDialogProps) {
  const t = useTranslations("places.detail.deleteDialog")
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" className="gap-1.5" />
        }
      >
        <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
        {t("confirm")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete()
              setOpen(false)
            }}
            disabled={isPending}
          >
            {isPending && (
              <HugeiconsIcon
                icon={Loading03Icon}
                className="size-4 animate-spin"
              />
            )}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
