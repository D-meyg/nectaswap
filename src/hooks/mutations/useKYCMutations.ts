import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { kycService } from '@/services/kycService'
import { QUERY_KEYS } from '@/lib/constants'

export function useApproveKYC() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (kycId: string) => kycService.approve(kycId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KYC_QUEUE })
      toast.success('KYC approved successfully')
    },
    onError: () => toast.error('Failed to approve KYC'),
  })
}

export function useRejectKYC() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ kycId, reason }: { kycId: string; reason: string }) =>
      kycService.reject(kycId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KYC_QUEUE })
      toast.success('KYC rejected')
    },
    onError: () => toast.error('Failed to reject KYC'),
  })
}

export function useRequestResubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ kycId, message }: { kycId: string; message: string }) =>
      kycService.resubmit(kycId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KYC_QUEUE })
      toast.success('Resubmission requested')
    },
    onError: () => toast.error('Failed to request resubmission'),
  })
}
