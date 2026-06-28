import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const transactionService = {
  getTransactions: async (params?: Record<string, unknown>) => {
    const { data } = await client.get(ENDPOINTS.TRANSACTIONS.LIST, { params });

    console.log("Transaction:", data)
    return data;
  },

  getTransactionDetail: async (id: string) => {
    const { data } = await client.get(ENDPOINTS.TRANSACTIONS.DETAIL(id));
    return data;
  },

  updateStatus: async (payload: { id: string; status: string }) => {
    const { data } = await client.patch(ENDPOINTS.TRANSACTIONS.STATUS, payload);
    return data;
  },

  getPendingApprovals: async () => {
    const { data } = await client.get(ENDPOINTS.TRANSACTIONS.PENDING_APPROVALS);
    return data;
  },

  approveFlag: async (flagId: string, notes?: string) => {
    const { data } = await client.patch(
      ENDPOINTS.TRANSACTIONS.APPROVE_FLAG(flagId),
      null,
      { params: { notes } },
    );
    return data;
  },

  rejectFlag: async (flagId: string, notes?: string) => {
    const { data } = await client.patch(
      ENDPOINTS.TRANSACTIONS.REJECT_FLAG(flagId),
      null,
      { params: { notes } },
    );
    return data;
  },

  getFailedList: async () => {
    const { data } = await client.get(ENDPOINTS.TRANSACTIONS.FAILED_LIST);
    return data;
  },

  retryFailed: async (id: string) => {
    const { data } = await client.post(ENDPOINTS.TRANSACTIONS.FAILED_RETRY(id));
    return data;
  },

  resolveFailed: async (id: string) => {
    const { data } = await client.patch(
      ENDPOINTS.TRANSACTIONS.FAILED_RESOLVE(id),
    );
    return data;
  },

  refundFailed: async (id: string) => {
    const { data } = await client.post(
      ENDPOINTS.TRANSACTIONS.FAILED_REFUND(id),
    );
    return data;
  },
};
