import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const activityService = {
  getUserActivity: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.ACTIVITY(userId));
    return data;
  },
  getUserAuditLog: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.AUDIT_LOG(userId));
    return data;
  },
};
