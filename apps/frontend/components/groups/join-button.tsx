"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Logout01Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useJoinGroup, useLeaveGroup } from "@/hooks/use-groups"
import type { GroupMember } from "@/services"

interface JoinButtonProps {
  groupId: string
  currentUserId: string
  members: GroupMember[]
}

export function JoinButton({ groupId, currentUserId, members }: JoinButtonProps) {
  const t = useTranslations("groups.detail")
  const [leaveOpen, setLeaveOpen] = useState(false)

  const currentUserMember = members.find((m) => m.userId === currentUserId)
  const isMember = !!currentUserMember
  const isOwner = currentUserMember?.role === "OWNER"

  const joinMutation = useJoinGroup()
  const leaveMutation = useLeaveGroup()

  const handleJoin = () => {
    joinMutation.mutate(groupId)
  }

  const handleLeave = () => {
    leaveMutation.mutate(groupId, {
      onSuccess: () => setLeaveOpen(false),
    })
  }

  if (!isMember) {
    return (
      <Button
        onClick={handleJoin}
        disabled={joinMutation.isPending}
        className="w-full"
      >
        {joinMutation.isPending && (
          <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
        )}
        {t("join")}
      </Button>
    )
  }

  if (isOwner) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
        {t("ownerNotice")}
      </div>
    )
  }

  return (
    <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="w-full" />
        }
      >
        <HugeiconsIcon icon={Logout01Icon} className="size-4" />
        {t("leave")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("leaveConfirmTitle")}</DialogTitle>
          <DialogDescription>{t("leaveConfirmDescription")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setLeaveOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={leaveMutation.isPending}
          >
            {leaveMutation.isPending && (
              <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
            )}
            {t("confirmLeave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
