import client from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { PaginatedResponse, Transaction } from '@/api/types'
import { PAGE_SIZE } from '@/lib/constants'

interface ListParams {
  page?:   number
  search?: string
  status?: string
  crypto?: string
}

export const transactionService = {
  list: (params: ListParams = {}) =>
    client
      .get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS.LIST, {
        params: { page_size: PAGE_SIZE, ...params },
      })
      .then(r => r.data),

  get: (id: string) =>
    client.get<Transaction>(ENDPOINTS.TRANSACTIONS.DETAIL(id)).then(r => r.data),

  export: (params: ListParams = {}) =>
    client
      .get(ENDPOINTS.TRANSACTIONS.EXPORT, { params, responseType: 'blob' })
      .then(r => r.data),
}
