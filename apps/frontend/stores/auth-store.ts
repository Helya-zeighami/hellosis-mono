import { create } from "zustand"

import {
  getSession,
  setSession as persistSession,
  clearSession as removePersistedSession,
  type Session,
} from "@/lib/session"

interface AuthState {
  session: Session | null
  setSession: (session: Session) => void
  updateSession: (session: Session) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: typeof document === "undefined" ? null : getSession(),
  setSession: (session) => {
    persistSession(session)
    set({ session })
  },
  updateSession: (session) => {
    persistSession(session)
    set({ session })
  },
  clearSession: () => {
    removePersistedSession()
    set({ session: null })
  },
}))