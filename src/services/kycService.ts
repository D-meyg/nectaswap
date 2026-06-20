import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const kycService = {
  getStats: async () => {
    const { data } = await client.get(ENDPOINTS.KYC.STATS);
    return data;
  },

  getApplications: async (params?: Record<string, unknown>) => {
    const { data } = await client.get(ENDPOINTS.KYC.APPLICATIONS, { params });
    return data;
  },

  getApplicationDetail: async (id: string) => {
    const { data } = await client.get(ENDPOINTS.KYC.DETAIL(id));
    return data;
  },

  reviewApplication: async (
    id: string,
    payload: { action: "approve" | "reject"; rejection_reason?: string },
  ) => {
    const { data } = await client.patch(ENDPOINTS.KYC.REVIEW(id), payload);
    return data;
  },

  getGeneralKYC: async () => {
    const { data } = await client.get(ENDPOINTS.KYC.GENERAL);
    return data;
  },
};
