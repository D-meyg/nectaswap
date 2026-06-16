import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser } from '@/api/types'

interface AuthState {
  user:     AdminUser | null
  token:    string | null
  isAuthed: boolean
  setAuth:  (user: AdminUser, token: string) => void
  clearAuth:() => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:     null,
      token:    null,
      isAuthed: true,

      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token)
        set({ user, token, isAuthed: true })
      },

      clearAuth: () => {
        localStorage.removeItem('auth_token')
        set({ user: null, token: null, isAuthed: false })
      },
    }),
    { name: 'nectaswap-auth', partialize: (s) => ({ user: s.user, token: s.token, isAuthed: s.isAuthed }) }
  )
)
