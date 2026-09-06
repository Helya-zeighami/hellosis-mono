"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Send } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function MessageInput({
  value,
  onChange,
  onSend,
  isSending,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isSending?: boolean
  disabled?: boolean
}) {
  const t = useTranslations("messaging")
  const canSend = value.trim().length > 0 && !isSending && !disabled

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <div className="flex shrink-0 items-end gap-2 border-t border-border/60 p-3">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("inputPlaceholder")}
        aria-label={t("inputPlaceholder")}
        maxLength={2000}
        rows={1}
        disabled={disabled}
        className="max-h-32 min-h-10 flex-1 overflow-y-auto"
      />
      <Button
        type="button"
        size="icon"
        onClick={onSend}
        disabled={!canSend}
        aria-label={t("send")}
      >
        <HugeiconsIcon icon={Send} />
      </Button>
    </div>
  )
}