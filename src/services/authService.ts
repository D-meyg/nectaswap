import client from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { AdminUser } from '@/api/types'

interface LoginPayload  { email: string; password: string }
interface LoginResponse { user: AdminUser; token: string }

export const authService = {
  login:   (payload: LoginPayload) =>
    client.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, payload).then(r => r.data),

  logout:  () =>
    client.post(ENDPOINTS.AUTH.LOGOUT).then(r => r.data),

  me:      () =>
    client.get<AdminUser>(ENDPOINTS.AUTH.ME).then(r => r.data),

  refresh: () =>
    client.post<{ token: string }>(ENDPOINTS.AUTH.REFRESH).then(r => r.data),
}
