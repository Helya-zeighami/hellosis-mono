"use client"

import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { GroupMember, GroupRole } from "@/services"

const ROLE_VARIANTS: Record<GroupRole, "default" | "secondary" | "outline"> = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "outline",
}

const ROLE_KEYS: Record<GroupRole, string> = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
}

interface GroupMembersProps {
  members: GroupMember[]
}

export function GroupMembers({ members }: GroupMembersProps) {
  const t = useTranslations("groups.members")

  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => {
        const profile = member.user.profile
        const name = profile?.firstName ?? t("unknown")
        const initials = name.slice(0, 2).toUpperCase()

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-xl border px-3 py-2"
          >
            <Avatar size="sm">
              {profile?.avatarUrl && (
                <AvatarImage src={profile.avatarUrl} alt={name} />
              )}
              <AvatarFallback className="bg-rose-100 text-rose-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {name}
              </span>
              <Badge variant={ROLE_VARIANTS[member.role]} className="text-xs">
                {t(ROLE_KEYS[member.role])}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}
