import type { Message } from "@/services"
import { useFormatter } from "next-intl"

import { cn } from "@/lib/utils"

export function MessageBubble({
  message,
  isOwn,
}: {
  message: Message
  isOwn: boolean
}) {
  const format = useFormatter()
  const time = format.dateTime(new Date(message.createdAt), {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-secondary text-secondary-foreground",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={cn(
            "mt-0.5 pt-0.5 text-end text-[10px] leading-none",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {time}
        </p>
      </div>
    </div>
  )
}