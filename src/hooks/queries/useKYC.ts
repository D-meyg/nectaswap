import { useQuery } from '@tanstack/react-query'
import { kycService } from '@/services/kycService'
import { QUERY_KEYS } from '@/lib/constants'

export function useKYCQueue() {
  return useQuery({
    queryKey: QUERY_KEYS.KYC_QUEUE,
    queryFn:  kycService.queue,
  })
}
