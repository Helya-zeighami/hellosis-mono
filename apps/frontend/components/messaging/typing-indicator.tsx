import { useTranslations } from "next-intl"

export function TypingIndicator({ name }: { name: string }) {
  const t = useTranslations("messaging")

  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2 text-sm text-muted-foreground">
        <span className="flex gap-0.5">
          <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
          <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
          <span className="size-1 animate-bounce rounded-full bg-current" />
        </span>
        {t("typing", { name })}
      </div>
    </div>
  )
}