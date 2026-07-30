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

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export interface PagedTransactions {
  rows: unknown[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Server-paginated transactions. Response envelope may be either
 * `{ data: [...], meta: {...} }` or `{ data: { data: [...], meta: {...} } }`.
 */
export function useTransactionsPaged(
  page: number,
  limit: number,
  extra?: Record<string, unknown>,
) {
  return useQuery<PagedTransactions>({
    queryKey: ["transactions", "paged", page, limit, extra],
    queryFn: async () => {
      const res = await transactionService.getTransactions({
        page,
        limit,
        ...(extra ?? {}),
      });
      const envelope = obj(res);
      // unwrap one or two levels of `data`
      const level1 = obj(envelope.data);
      const inner = Array.isArray(level1.data) ? level1 : envelope;
      const meta = obj(inner.meta);
      const rowsRaw = Array.isArray(inner.data)
        ? inner.data
        : Array.isArray(envelope.data)
          ? (envelope.data as unknown[])
          : unwrapApiList(res, ["transactions"]);
      return {
        rows: Array.isArray(rowsRaw) ? rowsRaw : [],
        total: num(meta.total, Array.isArray(rowsRaw) ? rowsRaw.length : 0),
        page: num(meta.page, page),
        pages: num(meta.pages, 1),
      };
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
