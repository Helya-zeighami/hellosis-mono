import { io, type Socket } from "socket.io-client"

import { useAuthStore } from "@/stores/auth-store"
import { API_URL } from "./http"
import type { ApiResponse } from "./profile"
import type { Message, PresenceResponse, TypingEvent } from "./messaging"
import type { GroupMessage, GroupTypingEvent } from "./group-messaging"

export type SocketStatus = "connecting" | "connected" | "disconnected"

export interface MessageSocketEventMap {
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
  "message:new": (response: ApiResponse<Message>) => void
  "typing:start": (event: TypingEvent) => void
  "typing:stop": (event: TypingEvent) => void
  "group-message:new": (message: GroupMessage) => void
  "group-typing:start": (event: GroupTypingEvent) => void
  "group-typing:stop": (event: GroupTypingEvent) => void
}

export interface MessageSocketEmitMap {
  "conversation:join": { conversationId: string }
  "message:send": { conversationId: string; content: string }
  "typing:start": { conversationId: string }
  "typing:stop": { conversationId: string }
  "group:join": { groupId: string }
  "group:leave": { groupId: string }
  "group-message:send": { groupId: string; content: string }
  "group-typing:start": { groupId: string }
  "group-typing:stop": { groupId: string }
}

type SocketHandler = (...args: unknown[]) => void

class MessagingSocketClient {
  private socket: Socket | null = null
  private pendingConnect: Promise<Socket> | null = null
  private handlers = new Map<string, Set<SocketHandler>>()

  getStatus(): SocketStatus {
    if (!this.socket) return "disconnected"
    if (this.socket.connected) return "connected"
    return "connecting"
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  async ensureConnected(): Promise<Socket> {
    const token = useAuthStore.getState().session?.accessToken
    if (!token) {
      throw new Error("Missing authentication session")
    }

    if (this.socket?.connected) return this.socket
    if (this.pendingConnect) return this.pendingConnect

    if (!this.socket) {
      const socket = io(API_URL, {
        autoConnect: false,
        auth: { token },
        transports: ["websocket", "polling"],
      })
      this.socket = socket
      this.attachQueuedHandlers(socket)
    }

    const socket = this.socket
    this.pendingConnect = new Promise((resolve, reject) => {
      const onConnect = () => {
        this.pendingConnect = null
        socket.off("connect_error", onError)
        resolve(socket)
      }
      const onError = (error: Error) => {
        this.pendingConnect = null
        socket.off("connect", onConnect)
        reject(error)
      }
      socket.once("connect", onConnect)
      socket.once("connect_error", onError)
    })

    socket.connect()

    return this.pendingConnect
  }

  disconnect() {
    this.pendingConnect = null
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
    }
    this.socket = null
    this.handlers.clear()
  }

  on<K extends keyof MessageSocketEventMap>(
    event: K,
    handler: MessageSocketEventMap[K],
  ): () => void {
    this.subscribe(event, handler as SocketHandler)
    if (this.socket) {
      this.socket.on(event, handler as never)
    }
    return () => this.off(event, handler)
  }

  off<K extends keyof MessageSocketEventMap>(
    event: K,
    handler: MessageSocketEventMap[K],
  ) {
    this.unsubscribe(event, handler as SocketHandler)
    if (this.socket) {
      this.socket.off(event, handler as never)
    }
  }

  emit<K extends keyof MessageSocketEmitMap>(
    event: K,
    payload: MessageSocketEmitMap[K],
  ) {
    this.socket?.emit(event, payload)
  }

  private subscribe(eventName: string, handler: SocketHandler) {
    let set = this.handlers.get(eventName)
    if (!set) {
      set = new Set()
      this.handlers.set(eventName, set)
    }
    set.add(handler)
  }

  private unsubscribe(eventName: string, handler: SocketHandler) {
    this.handlers.get(eventName)?.delete(handler)
  }

  private attachQueuedHandlers(socket: Socket) {
    this.handlers.forEach((handlers, eventName) => {
      handlers.forEach((handler) => socket.on(eventName, handler as never))
    })
  }
}

export const messagingSocket = new MessagingSocketClient()

export function checkPresence(
  userId: string,
  timeoutMs = 5000,
): Promise<PresenceResponse> {
  return new Promise((resolve) => {
    const socket = messagingSocket.getSocket()
    if (!socket) {
      resolve({ userId, isOnline: false })
      return
    }

    let settled = false
    const finish = (response: PresenceResponse) => {
      if (settled) return
      settled = true
      resolve(response)
    }

    const timer = setTimeout(() => finish({ userId, isOnline: false }), timeoutMs)

    socket.emit("presence:check", { userId }, (response: PresenceResponse) => {
      clearTimeout(timer)
      finish(response)
    })
  })
}