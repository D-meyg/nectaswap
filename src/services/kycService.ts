import client from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { KYCSubmission, KYCDetail, KYCHistoryEvent } from '@/api/types'

export const kycService = {
  queue:    () =>
    client.get<KYCSubmission[]>(ENDPOINTS.KYC.QUEUE).then(r => r.data),

  get:      (id: string) =>
    client.get<KYCDetail>(ENDPOINTS.KYC.DETAIL(id)).then(r => r.data),

  history:  (userId: string) =>
    client.get<KYCHistoryEvent[]>(ENDPOINTS.KYC.HISTORY(userId)).then(r => r.data),

  approve:  (id: string) =>
    client.post(ENDPOINTS.KYC.APPROVE(id)).then(r => r.data),

  reject:   (id: string, reason: string) =>
    client.post(ENDPOINTS.KYC.REJECT(id), { reason }).then(r => r.data),

  resubmit: (id: string, message: string) =>
    client.post(ENDPOINTS.KYC.RESUBMIT(id), { message }).then(r => r.data),
}
