import client from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { PaginatedResponse, User, UserDetail } from '@/api/types'
import { PAGE_SIZE } from '@/lib/constants'

interface ListParams { page?: number; search?: string; status?: string }

export const userService = {
  list: (params: ListParams = {}) =>
    client
      .get<PaginatedResponse<User>>(ENDPOINTS.USERS.LIST, {
        params: { page_size: PAGE_SIZE, ...params },
      })
      .then(r => r.data),

  get:      (id: string) =>
    client.get<UserDetail>(ENDPOINTS.USERS.DETAIL(id)).then(r => r.data),

  freeze:   (id: string) =>
    client.post(ENDPOINTS.USERS.FREEZE(id)).then(r => r.data),

  unfreeze: (id: string) =>
    client.post(ENDPOINTS.USERS.UNFREEZE(id)).then(r => r.data),
}
