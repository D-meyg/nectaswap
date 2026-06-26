import { useQuery } from '@tanstack/react-query'
import { transactionService } from '@/services/transactionService'
import { QUERY_KEYS } from '@/lib/constants'

interface UseTransactionsParams {
  page?:   number
  search?: string
  status?: string
  crypto?: string
}

export function useTransactions(params: UseTransactionsParams = {}) {
  const { page = 1, search = '', status, crypto } = params
  return useQuery({
    queryKey: [...QUERY_KEYS.TRANSACTIONS, page, search, status, crypto],
    queryFn:  () => transactionService.list({ page, search, status, crypto }),
  })
}
