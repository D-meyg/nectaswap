import { useQuery } from '@tanstack/react-query'
import { userService }    from '@/services/userService'
import { cardService }    from '@/services/cardService'
import { activityService }from '@/services/activityService'
import { noteService }    from '@/services/noteService'
import { kycService }     from '@/services/kycService'
import { QUERY_KEYS }     from '@/lib/constants'

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USER(id),
    queryFn:  () => userService.get(id),
    enabled:  !!id,
  })
}

export function useUserCards(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_CARDS(userId),
    queryFn:  () => cardService.list(userId),
    enabled:  !!userId,
  })
}

export function useUserActivity(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_ACTIVITY(userId),
    queryFn:  () => activityService.list(userId),
    enabled:  !!userId,
  })
}

export function useUserNotes(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_NOTES(userId),
    queryFn:  () => noteService.list(userId),
    enabled:  !!userId,
  })
}

export function useKYCHistory(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.KYC_HISTORY(userId),
    queryFn:  () => kycService.history(userId),
    enabled:  !!userId,
  })
}

export function useKYCDetail(kycId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.KYC_DETAIL(kycId),
    queryFn:  () => kycService.get(kycId),
    enabled:  !!kycId,
  })
}
