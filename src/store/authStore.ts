import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminUser } from "@/api/types";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthed: boolean;

  setAuth: (user: AdminUser, token: string, refreshToken: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthed: false,

      setAuth: (user, token, refreshToken) => {
        set({ user, token, refreshToken, isAuthed: true });
      },

      setTokens: (token, refreshToken) => {
        set({ token, refreshToken });
      },

      clearAuth: () => {
        set({ user: null, token: null, refreshToken: null, isAuthed: false });
      },
    }),
    {
      name: "nectaswap-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthed: state.isAuthed,
      }),
    },
  ),
);
