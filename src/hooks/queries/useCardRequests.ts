import { useQuery } from "@tanstack/react-query";
import { cardRequestService } from "@/services/cardRequestService";

interface UseCardRequestsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useCardRequests(params?: UseCardRequestsParams) {
  return useQuery<unknown>({
    queryKey: ["card-requests", params],
    queryFn: async () => {
      const res = await cardRequestService.getRequests(
        params as Record<string, unknown>,
      );
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useCardRequestStats() {
  return useQuery<unknown>({
    queryKey: ["card-requests", "stats"],
    queryFn: async () => {
      const res = await cardRequestService.getStats();
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useCardRequestDetail(id: string) {
  return useQuery<unknown>({
    queryKey: ["card-requests", id, "detail"],
    queryFn: async () => {
      const res = await cardRequestService.getRequestDetail(id);
      return res.data;
    },
    enabled: !!id,
  });
}
