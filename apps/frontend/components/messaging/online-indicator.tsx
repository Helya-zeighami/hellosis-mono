import { cn } from "@/lib/utils"

export function OnlineIndicator({
  isOnline,
  className,
}: {
  isOnline: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        isOnline ? "bg-emerald-500" : "bg-border",
        className,
      )}
    />
  )
}