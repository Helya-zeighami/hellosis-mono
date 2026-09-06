"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { ConversationList } from "./conversation-list"

export function MessagingShell({
  activeConversationId,
  children,
}: {
  activeConversationId?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
      <div className="flex h-[calc(100dvh-7rem)] min-h-[32rem] overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-foreground/10">
        <aside
          className={cn(
            "w-full shrink-0 border-e border-border/60 md:w-80",
            activeConversationId ? "hidden md:block" : "block",
          )}
        >
          <ConversationList activeConversationId={activeConversationId} />
        </aside>

        <section
          className={cn(
            "min-w-0 flex-1 flex-col",
            activeConversationId ? "flex" : "hidden md:flex",
          )}
        >
          {children}
        </section>
      </div>
    </div>
  )
}