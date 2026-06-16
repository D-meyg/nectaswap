import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userService } from '@/services/userService'
import { QUERY_KEYS } from '@/lib/constants'

export function useFreezeAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => userService.freeze(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USER(userId) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      toast.success('Account frozen successfully')
    },
    onError: () => toast.error('Failed to freeze account'),
  })
}

export function useUnfreezeAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => userService.unfreeze(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USER(userId) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      toast.success('Account unfrozen successfully')
    },
    onError: () => toast.error('Failed to unfreeze account'),
  })
}
