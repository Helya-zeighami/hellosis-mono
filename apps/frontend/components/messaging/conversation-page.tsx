"use client"

import { ChatWindow } from "./chat-window"
import { MessagingShell } from "./messages-shell"

export function ConversationPage({ conversationId }: { conversationId: string }) {
  return (
    <MessagingShell activeConversationId={conversationId}>
      <ChatWindow conversationId={conversationId} />
    </MessagingShell>
  )
}