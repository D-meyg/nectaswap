import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export interface ActivityLogParams {
  admin_id?: string;
  category?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export const teamService = {
  getMe: async () => {
    const { data } = await client.get(ENDPOINTS.TEAM.ME);
    return data;
  },

  getActivityLogs: async (params?: ActivityLogParams) => {
    const { data } = await client.get(ENDPOINTS.TEAM.ACTIVITY_LOGS, { params });
    return data;
  },
};
