"use client"

import { GroupChat } from "./group-chat"

export function GroupChatPage({ groupId }: { groupId: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
      <div className="flex h-[calc(100dvh-7rem)] min-h-[32rem] overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-foreground/10">
        <section className="flex min-w-0 flex-1 flex-col">
          <GroupChat groupId={groupId} />
        </section>
      </div>
    </div>
  )
}