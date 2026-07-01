import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const analyticsService = {
  getOverview: async (period = "30d") => {
    const { data } = await client.get(ENDPOINTS.ANALYTICS.OVERVIEW, {
      params: { period },
    });
    return data;
  },

  getRevenue: async (period = "12m", dateFrom?: string, dateTo?: string) => {
    const { data } = await client.get(ENDPOINTS.ANALYTICS.REVENUE, {
      params: { period, ...(dateFrom && { date_from: dateFrom }), ...(dateTo && { date_to: dateTo }) },
    });
    return data;
  },

  getUserGrowth: async (period = "12m") => {
    const { data } = await client.get(ENDPOINTS.ANALYTICS.USER_GROWTH, {
      params: { period },
    });
    return data;
  },
};
