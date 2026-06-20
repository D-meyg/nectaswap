import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const adminService = {
  getAdmins: async () => {
    const { data } = await client.get(ENDPOINTS.ADMINS.LIST);
    return data;
  },

  inviteAdmin: async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role_id: string;
  }) => {
    const { data } = await client.post(ENDPOINTS.ADMINS.INVITE, payload);
    return data;
  },

  getActivityLogs: async () => {
    const { data } = await client.get(ENDPOINTS.ADMINS.ACTIVITY_LOGS);
    return data;
  },

  getAdminDetail: async (id: string) => {
    const { data } = await client.get(ENDPOINTS.ADMINS.DETAIL(id));
    return data;
  },

  deleteAdmin: async (id: string) => {
    const { data } = await client.delete(ENDPOINTS.ADMINS.DETAIL(id));
    return data;
  },

  updateRole: async (payload: { admin_id: string; role_id: string }) => {
    const { data } = await client.patch(ENDPOINTS.ADMINS.ROLE, payload);
    return data;
  },

  suspendAdmin: async (id: string) => {
    const { data } = await client.patch(ENDPOINTS.ADMINS.SUSPEND(id));
    return data;
  },

  updateAppVersion: async (payload: {
    latest_version: string;
    update_message: string;
  }) => {
    const { data } = await client.patch(ENDPOINTS.ADMINS.APP_UPDATE, payload);
    return data;
  },
};