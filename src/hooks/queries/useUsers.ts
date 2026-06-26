import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/userService'
import { QUERY_KEYS } from '@/lib/constants'

interface UseUsersParams {
  page?:   number
  search?: string
  status?: string
}

export function useUsers(params: UseUsersParams = {}) {
  const { page = 1, search = '', status } = params
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, page, search, status],
    queryFn:  () => userService.list({ page, search, status }),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USER(id),
    queryFn:  () => userService.get(id),
    enabled:  !!id,
  })
}
