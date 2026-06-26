import { useQuery } from "@tanstack/react-query";
import { kycService } from "@/services/kycService";
import type { KYCSubmission } from "@/api/types";
import { unwrapApiList } from "@/utils/apiData";

export function useKYCQueue(params?: Record<string, unknown>) {
  return useQuery<KYCSubmission[]>({
    queryKey: ["kyc", "queue", params],
    queryFn: async () => {
      const res = await kycService.getApplications(params);
      return unwrapApiList<KYCSubmission>(res, ["applications"]);
    },
    staleTime: 60_000,
  });
}

export function useKYCStats() {
  return useQuery<unknown>({
    queryKey: ["kyc", "stats"],
    queryFn: async () => {
      const res = await kycService.getStats();
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useKYCDetail(id: string) {
  return useQuery<unknown>({
    queryKey: ["kyc", id, "detail"],
    queryFn: async () => {
      const res = await kycService.getApplicationDetail(id);
      return res.data;
    },
    enabled: !!id,
  });
}
