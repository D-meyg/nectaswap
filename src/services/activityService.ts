import client from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { ActivityEvent } from '@/api/types'

export const activityService = {
  list: (userId: string) =>
    client.get<ActivityEvent[]>(ENDPOINTS.ACTIVITY.LIST(userId)).then(r => r.data),
}
