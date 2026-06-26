import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import type {
  DashboardStats,
  WalletAsset,
  LiveAlert,
  RecentConversion,
  RecentActivityEntry,
  KYCSubmission,
  SystemHealth,
} from "@/api/types";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const res = await dashboardService.getStats();
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useDashboardLiquidity() {
  return useQuery<WalletAsset[]>({
    queryKey: ["dashboard", "liquidity"],
    queryFn: async () => {
      const res = await dashboardService.getLiquidity();
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useDashboardAlerts(limit = 10) {
  return useQuery<LiveAlert[]>({
    queryKey: ["dashboard", "alerts", limit],
    queryFn: async () => {
      const res = await dashboardService.getAlerts(limit);
      return res.data;
    },
    staleTime: 15_000,
  });
}

export function useDashboardRecentConversions(limit = 10) {
  return useQuery<RecentConversion[]>({
    queryKey: ["dashboard", "recent-conversions", limit],
    queryFn: async () => {
      const res = await dashboardService.getRecentConversions(limit);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useDashboardRecentActivity(limit = 10) {
  return useQuery<RecentActivityEntry[]>({
    queryKey: ["dashboard", "recent-activity", limit],
    queryFn: async () => {
      const res = await dashboardService.getRecentActivity(limit);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useDashboardKYCQueue(limit = 10) {
  return useQuery<KYCSubmission[]>({
    queryKey: ["dashboard", "kyc-queue", limit],
    queryFn: async () => {
      const res = await dashboardService.getKYCQueue(limit);
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useSystemHealth() {
  return useQuery<SystemHealth[]>({
    queryKey: ["dashboard", "system-health"],
    queryFn: async () => {
      const res = await dashboardService.getSystemHealth();
      return res.data;
    },
    staleTime: 60_000,
  });
}
