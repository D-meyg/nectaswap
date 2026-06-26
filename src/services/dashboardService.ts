import client from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  DashboardStats, LiveAlert, SystemHealth,
  RecentConversion, RecentActivityEntry, WalletAsset,
} from '@/api/types'

export const dashboardService = {
  stats:              () => client.get<DashboardStats>(ENDPOINTS.DASHBOARD.STATS).then(r => r.data),
  alerts:             () => client.get<LiveAlert[]>(ENDPOINTS.DASHBOARD.ALERTS).then(r => r.data),
  health:             () => client.get<SystemHealth[]>(ENDPOINTS.DASHBOARD.HEALTH).then(r => r.data),
  activity:           () => client.get<RecentActivityEntry[]>(ENDPOINTS.DASHBOARD.ACTIVITY).then(r => r.data),
  recentConversions:  () => client.get<RecentConversion[]>(ENDPOINTS.RECENT.CONVERSIONS).then(r => r.data),
  liquiditySnapshot:  () => client.get<WalletAsset[]>(ENDPOINTS.WALLETS.SNAPSHOT).then(r => r.data),
}
