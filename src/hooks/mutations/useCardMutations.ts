import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cardService } from '@/services/cardService'
import { QUERY_KEYS }  from '@/lib/constants'

export function useFreezeCard(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cardId: string) => cardService.freeze(cardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USER_CARDS(userId) })
      toast.success('Card frozen')
    },
    onError: () => toast.error('Failed to freeze card'),
  })
}

export function useUnfreezeCard(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cardId: string) => cardService.unfreeze(cardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USER_CARDS(userId) })
      toast.success('Card unfrozen')
    },
    onError: () => toast.error('Failed to unfreeze card'),
  })
}

export function useIssueCard(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { network: string; variant: string }) =>
      cardService.issue(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USER_CARDS(userId) })
      toast.success('Card issued successfully')
    },
    onError: () => toast.error('Failed to issue card'),
  })
}
