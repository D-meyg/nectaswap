import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export interface ActivityLogParams {
  admin_id?: string;
  category?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface InviteAdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role_id: string;
}

export const teamService = {
  getMe: async () => {
    const { data } = await client.get(ENDPOINTS.TEAM.ME);
    return data;
  },

  getTeam: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await client.get(ENDPOINTS.TEAM.LIST, { params });
    return data;
  },

  getActivityLogs: async (params?: ActivityLogParams) => {
    const { data } = await client.get(ENDPOINTS.TEAM.ACTIVITY_LOGS, { params });
    return data;
  },

  getRoles: async () => {
    const { data } = await client.get(ENDPOINTS.ROLES.LIST);
    return data;
  },

  inviteAdmin: async (payload: InviteAdminPayload) => {
    const { data } = await client.post(ENDPOINTS.TEAM.INVITE, payload);
    return data;
  },

  updateAdminRole: async (payload: { admin_id: string; role_id: string }) => {
    const { data } = await client.patch(ENDPOINTS.TEAM.ROLE, payload);
    return data;
  },

  deleteAdmin: async (id: string) => {
    const { data } = await client.delete(ENDPOINTS.TEAM.DELETE(id));
    return data;
  },
};
