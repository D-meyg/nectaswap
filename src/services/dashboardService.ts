import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const dashboardService = {
  getStats: async () => {
    const { data } = await client.get(ENDPOINTS.DASHBOARD.STATS);
    console.log("Activity", data)
    return data;
  },

  getLiquidity: async () => {
    const { data } = await client.get(ENDPOINTS.DASHBOARD.LIQUIDITY);
    return data;
  },

  getAlerts: async (limit = 10) => {
    const { data } = await client.get(ENDPOINTS.DASHBOARD.ALERTS, {
      params: { limit },
    });
    return data;
  },

  getRecentConversions: async (limit = 10) => {
    const { data } = await client.get(ENDPOINTS.DASHBOARD.RECENT_CONVERSIONS, {
      params: { limit },
    });
    return data;
  },

  getRecentActivity: async (limit = 10) => {
    const { data } = await client.get(ENDPOINTS.DASHBOARD.RECENT_ACTIVITY, {
      params: { limit },
    });
    return data;
  },

  getKYCQueue: async (limit = 10) => {
    const { data } = await client.get(ENDPOINTS.DASHBOARD.KYC_QUEUE, {
      params: { limit },
    });
    return data;
  },

  getSystemHealth: async () => {
    const { data } = await client.get(ENDPOINTS.DASHBOARD.SYSTEM_HEALTH);
    return data;
  },
};
