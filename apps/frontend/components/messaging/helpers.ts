import type { Conversation, UserSummary } from "@/services"

export function getOtherUser(
  conversation: Conversation,
  currentUserId: string,
): UserSummary {
  return conversation.userOne.id === currentUserId
    ? conversation.userTwo
    : conversation.userOne
}

export function getDisplayName(user: UserSummary): string | null {
  if (!user.profile) return null
  const name = [user.profile.firstName, user.profile.lastName]
    .filter(Boolean)
    .join(" ")
  return name || null
}

export function getInitials(user: UserSummary): string | null {
  if (!user.profile) return null
  const first = user.profile.firstName?.trim().charAt(0) ?? ""
  const last = user.profile.lastName?.trim().charAt(0) ?? ""
  const initials = (first + last).toUpperCase()
  return initials || null
}