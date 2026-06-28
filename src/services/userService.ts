import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const userService = {
  getUsers: async (params?: Record<string, unknown>) => {
    const { data } = await client.get(ENDPOINTS.USERS.LIST, { params });
    console.log("SRVICE", data)
    return data;
  },

  getUserDetail: async (id: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.DETAIL(id));
    return data;
  },

  restrictUser: async (payload: { user_id: string; status: boolean }) => {
    const { data } = await client.patch(ENDPOINTS.USERS.RESTRICTION, payload);
    return data;
  },

  softRestrictUser: async (payload: { user_id: string; status: boolean }) => {
    const { data } = await client.patch(
      ENDPOINTS.USERS.SOFT_RESTRICTION,
      payload,
    );
    return data;
  },

  executeWalletAction: async (payload: {
    user_id: string;
    action: "debit" | "credit";
    amount: number;
    description: string;
    pin: string;
  }) => {
    const { data } = await client.post(ENDPOINTS.USERS.WALLET_ACTION, payload);
    return data;
  },

  freezeAllCards: async (userId: string) => {
    const { data } = await client.patch(ENDPOINTS.USERS.FREEZE_CARDS(userId));
    return data;
  },

  getUserOverview: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.OVERVIEW(userId));
    return data;
  },

  getUserKYC: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.KYC(userId));
    return data;
  },

  getUserCards: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.CARDS(userId));
    return data;
  },

  getUserTransactions: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.TRANSACTIONS(userId));
    return data;
  },

  getUserReferrals: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.REFERRALS(userId));
    return data;
  },

  getUserActivity: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.ACTIVITY(userId));
    return data;
  },

  getUserNotes: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.NOTES(userId));
    return data;
  },

  createUserNote: async (
    userId: string,
    payload: { note: string; is_pinned: boolean },
  ) => {
    const { data } = await client.post(ENDPOINTS.USERS.NOTES(userId), payload);
    return data;
  },

  getUserAuditLog: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.AUDIT_LOG(userId));
    return data;
  },

  sendNotification: async (
    userId: string,
    payload: { title: string; message: string; priority: string },
  ) => {
    const { data } = await client.post(
      ENDPOINTS.USERS.SEND_NOTIFICATION(userId),
      payload,
    );
    return data;
  },
};
