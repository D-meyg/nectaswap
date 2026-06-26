import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const complianceService = {
  getStats: async () => {
    const { data } = await client.get(ENDPOINTS.COMPLIANCE.STATS);
    return data;
  },

  getFlaggedUsers: async () => {
    const { data } = await client.get(ENDPOINTS.COMPLIANCE.FLAGGED_USERS);
    return data;
  },

  flagUser: async (payload: {
    user_id: string;
    reason: string;
    risk_score: number;
    severity: string;
  }) => {
    const { data } = await client.post(
      ENDPOINTS.COMPLIANCE.FLAGGED_USERS,
      payload,
    );
    return data;
  },

  updateFlaggedUserStatus: async (payload: {
    flag_id: string;
    status: string;
    notes?: string;
  }) => {
    const { data } = await client.patch(
      ENDPOINTS.COMPLIANCE.FLAGGED_USERS_STATUS,
      payload,
    );
    return data;
  },

  getFlaggedTransactions: async () => {
    const { data } = await client.get(ENDPOINTS.COMPLIANCE.FLAGGED_TXNS);
    return data;
  },

  flagTransaction: async (payload: {
    transaction_id: string;
    user_id: string;
    transaction_type: string;
    amount: number;
    reason: string;
    severity: string;
  }) => {
    const { data } = await client.post(
      ENDPOINTS.COMPLIANCE.FLAGGED_TXNS,
      payload,
    );
    return data;
  },

  updateFlaggedTransactionStatus: async (payload: {
    flag_id: string;
    status: string;
    notes?: string;
  }) => {
    const { data } = await client.patch(
      ENDPOINTS.COMPLIANCE.FLAGGED_TXNS_STATUS,
      payload,
    );
    return data;
  },

  getRiskRules: async () => {
    const { data } = await client.get(ENDPOINTS.COMPLIANCE.RISK_RULES);
    return data;
  },

  updateRiskRule: async (
    id: string,
    payload: {
      rule_name: string;
      description: string;
      threshold: string;
      status: string;
      config: Record<string, unknown>;
    },
  ) => {
    const { data } = await client.patch(
      ENDPOINTS.COMPLIANCE.UPDATE_RULE(id),
      payload,
    );
    return data;
  },
};