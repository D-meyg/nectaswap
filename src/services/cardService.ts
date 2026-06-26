import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const cardService = {
  getStats: async () => {
    const { data } = await client.get(ENDPOINTS.CARDS.STATS);
    return data;
  },

  getCards: async (params?: Record<string, unknown>) => {
    const { data } = await client.get(ENDPOINTS.CARDS.LIST, { params });
    return data;
  },

  getCardDetail: async (id: string) => {
    const { data } = await client.get(ENDPOINTS.CARDS.DETAIL(id));
    return data;
  },

  getCardTransactions: async (id: string) => {
    const { data } = await client.get(ENDPOINTS.CARDS.TRANSACTIONS(id));
    return data;
  },

  getCardActivity: async (id: string) => {
    const { data } = await client.get(ENDPOINTS.CARDS.ACTIVITY(id));
    return data;
  },

  freezeCard: async (id: string) => {
    const { data } = await client.post(ENDPOINTS.CARDS.FREEZE(id));
    return data;
  },

  unfreezeCard: async (id: string) => {
    const { data } = await client.post(ENDPOINTS.CARDS.UNFREEZE(id));
    return data;
  },

  updateLimits: async (payload: {
    card_id: string;
    daily_limit: number;
    monthly_limit: number;
    per_transaction_limit: number;
  }) => {
    const { data } = await client.patch(ENDPOINTS.CARDS.LIMITS, payload);
    return data;
  },
};
