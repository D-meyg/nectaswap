import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export interface CardLimitsUpdate {
  card_id: string;
  daily_limit?: number;
  weekly_limit?: number;
  monthly_limit?: number;
  per_transaction_limit?: number;
  atm_limit?: number;
  international_limit?: number;
  enable_online_payments?: boolean;
  enable_contactless?: boolean;
  enable_international?: boolean;
  enable_atm_withdrawals?: boolean;
  enable_recurring_payments?: boolean;
  merchant_restrictions?: boolean;
  restricted_categories?: Record<string, unknown>;
  temporary_lock?: boolean;
  require_otp?: boolean;
  require_3ds?: boolean;
  require_cvv?: boolean;
  enable_risk_detection?: boolean;
}

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

  issueCard: async (payload: { user_id: string; [key: string]: unknown }) => {
    const { data } = await client.post(ENDPOINTS.CARDS.ISSUE, payload);
    return data;
  },

  resetPin: async (id: string) => {
    const { data } = await client.post(ENDPOINTS.CARDS.RESET_PIN(id), { card_id: id });
    return data;
  },

  replaceCard: async (id: string) => {
    const { data } = await client.post(ENDPOINTS.CARDS.REPLACE(id), { card_id: id });
    return data;
  },

  terminateCard: async (id: string) => {
    const { data } = await client.post(ENDPOINTS.CARDS.TERMINATE(id), { card_id: id });
    return data;
  },

  updateLimits: async (payload: CardLimitsUpdate) => {
    const { data } = await client.patch(ENDPOINTS.CARDS.LIMITS, payload);
    return data;
  },
};
