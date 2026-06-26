import client from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { Card } from '@/api/types'

export const cardService = {
  list:     (userId: string) =>
    client.get<Card[]>(ENDPOINTS.CARDS.LIST(userId)).then(r => r.data),

  get:      (cardId: string) =>
    client.get<Card>(ENDPOINTS.CARDS.DETAIL(cardId)).then(r => r.data),

  freeze:   (cardId: string) =>
    client.post(ENDPOINTS.CARDS.FREEZE(cardId)).then(r => r.data),

  unfreeze: (cardId: string) =>
    client.post(ENDPOINTS.CARDS.UNFREEZE(cardId)).then(r => r.data),

  issue:    (userId: string, payload: { network: string; variant: string }) =>
    client.post<Card>(ENDPOINTS.CARDS.ISSUE(userId), payload).then(r => r.data),
}
