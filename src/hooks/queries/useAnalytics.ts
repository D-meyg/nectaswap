import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analyticsService";
import type { AnalyticsOverview, AnalyticsRevenue, AnalyticsUserGrowth } from "@/api/types";

export function useAnalyticsOverview(period = "30d") {
  return useQuery<AnalyticsOverview>({
    queryKey: ["analytics", "overview", period],
    queryFn: async () => {
      const res = await analyticsService.getOverview(period);
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useAnalyticsRevenue(period = "12m", dateFrom?: string, dateTo?: string) {
  return useQuery<AnalyticsRevenue>({
    queryKey: ["analytics", "revenue", period, dateFrom, dateTo],
    queryFn: async () => {
      const res = await analyticsService.getRevenue(period, dateFrom, dateTo);
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useAnalyticsUserGrowth(period = "12m") {
  return useQuery<AnalyticsUserGrowth>({
    queryKey: ["analytics", "user-growth", period],
    queryFn: async () => {
      const res = await analyticsService.getUserGrowth(period);
      return res.data;
    },
    staleTime: 60_000,
  });
}
