"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useAuthStore } from "@/stores/auth-store"
import { messagingSocket, type SocketStatus } from "@/services/socket"
import type { GroupMessage, GroupTypingEvent } from "@/services"
import { useGroup } from "@/hooks/use-groups"
import { useGroupMessages } from "@/hooks/use-group-messaging"
import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GroupChatHeader } from "./group-chat-header"
import { GroupMessageList } from "./group-message-list"
import { GroupMessageInput } from "./group-message-input"

const TYPING_STOP_DELAY = 1500
const TYPING_STALE_TIMEOUT = 4000

function GroupChatSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border/60 px-3 py-2.5">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-10 w-2/3 max-w-64 rounded-2xl rounded-bl-md" />
        <Skeleton className="ms-auto h-10 w-1/2 max-w-64 rounded-2xl rounded-br-md" />
        <Skeleton className="h-10 w-2/3 max-w-64 rounded-2xl rounded-bl-md" />
      </div>
    </div>
  )
}

function GroupChatError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("groupMessaging")

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-destructive">{t("errors.group")}</p>
      <button
        type="button"
        onClick={onRetry}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        {t("retry")}
      </button>
    </div>
  )
}

function NotMemberState({ groupId }: { groupId: string }) {
  const t = useTranslations("groupMessaging")

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-muted-foreground">{t("notMember")}</p>
      <Link
        href={`/groups/${groupId}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        {t("backToGroup")}
      </Link>
    </div>
  )
}

export function GroupChat({ groupId }: { groupId: string }) {
  const t = useTranslations("groupMessaging")
  const currentUserId = useAuthStore((s) => s.session?.user.id ?? "")

  const {
    data: group,
    isLoading: groupLoading,
    isError: groupError,
    refetch: refetchGroup,
  } = useGroup(groupId)

  const {
    data: historyData,
    isPending: messagesLoading,
    isError: messagesError,
    refetch: refetchMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGroupMessages(groupId)

  const [liveMessages, setLiveMessages] = useState<GroupMessage[]>([])
  const [typingUserIds, setTypingUserIds] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<SocketStatus>(
    messagingSocket.getStatus(),
  )
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)

  const typingLockRef = useRef<{
    active: boolean
    timer: ReturnType<typeof setTimeout> | null
  }>({ active: false, timer: null })
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  )

  const history = useMemo(
    () => (historyData?.pages ?? []).flat().reverse(),
    [historyData?.pages],
  )

  const messages = useMemo(() => {
    const seen = new Set<string>()
    const merged: GroupMessage[] = []

    for (const message of history) {
      if (!seen.has(message.id)) {
        seen.add(message.id)
        merged.push(message)
      }
    }
    for (const message of liveMessages) {
      if (!seen.has(message.id)) {
        seen.add(message.id)
        merged.push(message)
      }
    }

    return merged
  }, [history, liveMessages])

  const memberNames = useMemo(() => {
    if (!group) return new Map<string, string>()
    const map = new Map<string, string>()
    for (const member of group.members) {
      map.set(
        member.userId,
        member.user.profile?.firstName ?? t("unknown"),
      )
    }
    return map
  }, [group, t])

  const typingNames = useMemo(
    () =>
      typingUserIds
        .map((userId) => memberNames.get(userId) ?? t("unknown"))
        .filter((name, index, all) => all.indexOf(name) === index),
    [typingUserIds, memberNames, t],
  )

  const isMember = group
    ? group.members.some((member) => member.userId === currentUserId)
    : false

  useEffect(() => {
    let active = true
    const lock = typingLockRef.current
    const timers = typingTimersRef.current

    const handleNewMessage = (message: GroupMessage) => {
      if (!message || message.groupId !== groupId) return

      setLiveMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev
        return [...prev, message]
      })
    }

    const removeTypingUser = (userId: string) => {
      const timer = timers.get(userId)
      if (timer) {
        clearTimeout(timer)
        timers.delete(userId)
      }
      setTypingUserIds((prev) => prev.filter((id) => id !== userId))
    }

    const handleTypingStart = (event: GroupTypingEvent) => {
      if (event.groupId !== groupId || event.userId === currentUserId) return

      setTypingUserIds((prev) =>
        prev.includes(event.userId) ? prev : [...prev, event.userId],
      )
      const existing = timers.get(event.userId)
      if (existing) clearTimeout(existing)
      timers.set(
        event.userId,
        setTimeout(() => removeTypingUser(event.userId), TYPING_STALE_TIMEOUT),
      )
    }

    const handleTypingStop = (event: GroupTypingEvent) => {
      if (event.groupId !== groupId) return
      removeTypingUser(event.userId)
    }

    const handleConnect = () => {
      setConnectionStatus("connected")
      messagingSocket.emit("group:join", { groupId })
    }

    const handleDisconnect = () => {
      setConnectionStatus("disconnected")
    }

    const handleConnectError = () => {
      setConnectionStatus("disconnected")
    }

    const offMessage = messagingSocket.on("group-message:new", handleNewMessage)
    const offTypingStart = messagingSocket.on("group-typing:start", handleTypingStart)
    const offTypingStop = messagingSocket.on("group-typing:stop", handleTypingStop)
    const offConnect = messagingSocket.on("connect", handleConnect)
    const offDisconnect = messagingSocket.on("disconnect", handleDisconnect)
    const offConnectError = messagingSocket.on("connect_error", handleConnectError)

    messagingSocket
      .ensureConnected()
      .then(() => {
        if (!active) return
        messagingSocket.emit("group:join", { groupId })
        setConnectionStatus("connected")
      })
      .catch(() => {
        if (active) setConnectionStatus("disconnected")
      })

    return () => {
      active = false
      offMessage()
      offTypingStart()
      offTypingStop()
      offConnect()
      offDisconnect()
      offConnectError()

      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()

      if (lock.active) {
        messagingSocket.emit("group-typing:stop", { groupId })
        lock.active = false
      }
      if (lock.timer) {
        clearTimeout(lock.timer)
        lock.timer = null
      }
    }
  }, [groupId, currentUserId])

  const handleInputChange = (value: string) => {
    setInput(value)

    const lock = typingLockRef.current
    if (!messagingSocket.isConnected()) return

    if (value.trim().length > 0) {
      if (!lock.active) {
        messagingSocket.emit("group-typing:start", { groupId })
        lock.active = true
      }
      if (lock.timer) clearTimeout(lock.timer)
      lock.timer = setTimeout(() => {
        if (typingLockRef.current.active) {
          messagingSocket.emit("group-typing:stop", { groupId })
          typingLockRef.current.active = false
        }
        typingLockRef.current.timer = null
      }, TYPING_STOP_DELAY)
    }
  }

  const handleSend = async () => {
    const content = input.trim()
    if (!content || isSending || !groupId) return

    setIsSending(true)

    const lock = typingLockRef.current
    if (lock.active) {
      messagingSocket.emit("group-typing:stop", { groupId })
      lock.active = false
    }
    if (lock.timer) {
      clearTimeout(lock.timer)
      lock.timer = null
    }

    try {
      const socket = await messagingSocket.ensureConnected()
      setInput("")
      socket.emit("group-message:send", { groupId, content }, () => {
        setIsSending(false)
      })
      setTimeout(() => setIsSending(false), 8000)
    } catch {
      setIsSending(false)
      toast.error(t("errors.send"))
    }
  }

  if (groupLoading) {
    return <GroupChatSkeleton />
  }

  if (groupError || !group) {
    return <GroupChatError onRetry={refetchGroup} />
  }

  if (!isMember) {
    return <NotMemberState groupId={groupId} />
  }

  return (
    <div className="flex h-full flex-col">
      <GroupChatHeader
        groupId={groupId}
        groupName={group.name}
        groupImageUrl={group.imageUrl}
        memberCount={group.members.length}
        connectionStatus={connectionStatus}
      />

      {messagesError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm text-destructive">{t("errors.messages")}</p>
          <button
            type="button"
            onClick={() => refetchMessages()}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("retry")}
          </button>
        </div>
      ) : (
        <GroupMessageList
          currentUserId={currentUserId}
          messages={messages}
          typingNames={typingNames}
          isLoading={messagesLoading}
          hasMore={hasNextPage}
          isFetchingOlder={isFetchingNextPage}
          onLoadOlder={() => fetchNextPage()}
        />
      )}

      <GroupMessageInput
        value={input}
        onChange={handleInputChange}
        onSend={handleSend}
        isSending={isSending}
      />
    </div>
  )
}