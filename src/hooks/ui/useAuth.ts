import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

/**
 * Wraps login/logout with mutation state + store updates.
 * Usage: const { login, isPending } = useAuth()
 */
export function useAuth() {
  const setAuth   = useAuthStore(s => s.setAuth)
  const clearAuth = useAuthStore(s => s.clearAuth)

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}`)
    },
    onError: () => toast.error('Invalid email or password'),
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Always clear local state even if API call fails
      clearAuth()
    },
  })

  return {
    login:          loginMutation.mutate,
    logout:         logoutMutation.mutate,
    loginPending:   loginMutation.isPending,
    logoutPending:  logoutMutation.isPending,
  }
}
