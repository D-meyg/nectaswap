import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

// ── Domain types (shared by the card-request pages & pills) ──
export interface CardRequestRow {
  id: string;
  user_name: string;
  user_email: string;
  card_type: "Virtual" | "Physical";
  currency: "NGN" | "USD" | "EUR" | "GBP" | string;
  requested_on: string;
  kyc_status: "Verified" | "Not Verified";
  approval_status: "Pending" | "Approved" | "Rejected" | "Under Review";
  assigned_admin: string;
}

export interface CardRequestDetail extends CardRequestRow {
  phone: string;
  reason: string;
  monthly_volume: number;
  transactions_30d: number;
}

export interface CardRequestStats {
  pending: number;
  approved: number;
  rejected: number;
  active_cards: number;
}

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

export const cardRequestService = {
  getStats: async () => {
    const { data } = await client.get(ENDPOINTS.CARD_REQUESTS.STATS);
    return data;
  },

  getRequests: async (params?: ListParams) => {
    const { data } = await client.get(ENDPOINTS.CARD_REQUESTS.LIST, { params });
    return data;
  },

  getRequestDetail: async (id: string) => {
    const { data } = await client.get(ENDPOINTS.CARD_REQUESTS.DETAIL(id));
    return data;
  },

  approve: async (id: string, payload?: Record<string, unknown>) => {
    const { data } = await client.post(
      ENDPOINTS.CARD_REQUESTS.APPROVE(id),
      payload ?? {},
    );
    return data;
  },

  reject: async (id: string, payload?: Record<string, unknown>) => {
    const { data } = await client.post(
      ENDPOINTS.CARD_REQUESTS.REJECT(id),
      payload ?? {},
    );
    return data;
  },

  assign: async (id: string, payload?: Record<string, unknown>) => {
    const { data } = await client.post(
      ENDPOINTS.CARD_REQUESTS.ASSIGN(id),
      payload ?? {},
    );
    return data;
  },

  requestInfo: async (id: string, payload?: Record<string, unknown>) => {
    const { data } = await client.post(
      ENDPOINTS.CARD_REQUESTS.REQUEST_INFO(id),
      payload ?? {},
    );
    return data;
  },
};
