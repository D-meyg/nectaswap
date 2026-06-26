import { useQuery } from "@tanstack/react-query";
import { cardService } from "@/services/cardService";

interface UseCardsParams {
  page?: number;
  search?: string;
  type?: string;
  status?: string;
  [key: string]: unknown;
}

export function useCards(params?: UseCardsParams) {
  return useQuery<unknown[]>({
    queryKey: ["cards", params],
    queryFn: async () => {
      const res = await cardService.getCards(params as Record<string, unknown>);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useCardStats() {
  return useQuery<unknown>({
    queryKey: ["cards", "stats"],
    queryFn: async () => {
      const res = await cardService.getStats();
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useCardDetail(id: string) {
  return useQuery<unknown>({
    queryKey: ["cards", id, "detail"],
    queryFn: async () => {
      const res = await cardService.getCardDetail(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCardTransactions(id: string) {
  return useQuery<unknown[]>({
    queryKey: ["cards", id, "transactions"],
    queryFn: async () => {
      const res = await cardService.getCardTransactions(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCardActivity(id: string) {
  return useQuery<unknown[]>({
    queryKey: ["cards", id, "activity"],
    queryFn: async () => {
      const res = await cardService.getCardActivity(id);
      return res.data;
    },
    enabled: !!id,
  });
}
