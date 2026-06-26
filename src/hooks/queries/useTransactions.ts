import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/transactionService";
import { unwrapApiList, unwrapApiObject } from "@/utils/apiData";

interface UseTransactionsParams {
  page?: number;
  search?: string;
  status?: string;
  type?: string;
  [key: string]: unknown;
}

export function useTransactions(params?: UseTransactionsParams) {
  return useQuery<unknown[]>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const res = await transactionService.getTransactions(
        params as Record<string, unknown>,
      );
      return unwrapApiList(res, ["transactions"]);
    },
    staleTime: 30_000,
  });
}

export function useTransactionDetail(id: string) {
  return useQuery<unknown>({
    queryKey: ["transactions", id, "detail"],
    queryFn: async () => {
      const res = await transactionService.getTransactionDetail(id);
      return unwrapApiObject(res, {});
    },
    enabled: !!id,
  });
}

export function usePendingTransactionApprovals() {
  return useQuery<unknown[]>({
    queryKey: ["transactions", "pending-approvals"],
    queryFn: async () => {
      const res = await transactionService.getPendingApprovals();
      return unwrapApiList(res, ["transactions", "approvals"]);
    },
    staleTime: 30_000,
  });
}

export function useFailedTransactions() {
  return useQuery<unknown[]>({
    queryKey: ["transactions", "failed"],
    queryFn: async () => {
      const res = await transactionService.getFailedList();
      return unwrapApiList(res, ["transactions", "failed_transactions"]);
    },
    staleTime: 30_000,
  });
}
