import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'
import { QUERY_KEYS } from '@/lib/constants'

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn:  dashboardService.stats,
    refetchInterval: 30_000,
  })
}

export function useLiveAlerts() {
  return useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD, 'alerts'],
    queryFn:  dashboardService.alerts,
    refetchInterval: 15_000,
  })
}

export function useSystemHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_HEALTH,
    queryFn:  dashboardService.health,
    refetchInterval: 60_000,
  })
}

export function useRecentConversions() {
  return useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD, 'conversions'],
    queryFn:  dashboardService.recentConversions,
    refetchInterval: 30_000,
  })
}

export function useLiquiditySnapshot() {
  return useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD, 'liquidity'],
    queryFn:  dashboardService.liquiditySnapshot,
    refetchInterval: 30_000,
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD, 'activity'],
    queryFn:  dashboardService.activity,
    refetchInterval: 20_000,
  })
}
