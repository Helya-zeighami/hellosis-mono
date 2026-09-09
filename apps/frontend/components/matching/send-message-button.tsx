"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Send, Loading03Icon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { useApiErrorMessage } from "@/hooks/use-api-error"
import { useCreateConversation } from "@/hooks/use-messaging"

export function SendMessageButton({ userId }: { userId: string }) {
  const t = useTranslations("profile.detail")
  const router = useRouter()
  const getErrorMessage = useApiErrorMessage()
  const { mutate, isPending } = useCreateConversation()

  const handleClick = () => {
    if (isPending || !userId) return

    mutate(userId, {
      onSuccess: (response) => {
        const conversationId = response.data?.id
        if (!conversationId) return
        router.push(`/dashboard/messages/${conversationId}`)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  return (
    <Button size="default" onClick={handleClick} disabled={isPending}>
      {isPending ? (
        <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
      ) : (
        <HugeiconsIcon icon={Send} />
      )}
      {isPending ? t("openingChat") : t("sendMessage")}
    </Button>
  )
}