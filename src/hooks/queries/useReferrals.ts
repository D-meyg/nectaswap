import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { unwrapApiObject } from "@/utils/apiData";

interface PagedResult {
  rows: unknown[];
  total: number;
  page: number;
  pages: number;
}

// Pull the array + pagination meta out of a { data: [...], meta: {...} } body.
function toPaged(body: unknown, fallbackKeys: string[] = []): PagedResult {
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  let rows: unknown[] = Array.isArray(b.data) ? (b.data as unknown[]) : [];
  if (!rows.length) {
    for (const k of [...fallbackKeys, "items", "results"]) {
      const v = (b.data as Record<string, unknown>)?.[k] ?? b[k];
      if (Array.isArray(v)) { rows = v as unknown[]; break; }
    }
  }
  const meta = b.meta && typeof b.meta === "object" ? (b.meta as Record<string, unknown>) : {};
  const num = (v: unknown, d: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : d;
  };
  return {
    rows,
    total: num(meta.total, rows.length),
    page: num(meta.page, 1),
    pages: num(meta.pages, 1),
  };
}

export function useReferralStats() {
  return useQuery<unknown>({
    queryKey: ["referrals", "stats"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.REFERRALS.STATS);
      return unwrapApiObject(data, {});
    },
    staleTime: 60_000,
  });
}

export function useReferrers(page = 1, limit = 20) {
  return useQuery<PagedResult>({
    queryKey: ["referrals", "referrers", page, limit],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.REFERRALS.REFERRERS, {
        params: { page, limit },
      });
      return toPaged(data, ["referrers"]);
    },
    staleTime: 60_000,
  });
}

export function useReferredUsers(page = 1, limit = 20) {
  return useQuery<PagedResult>({
    queryKey: ["referrals", "referred-users", page, limit],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.REFERRALS.REFERRED_USERS, {
        params: { page, limit },
      });
      return toPaged(data, ["referred_users", "users"]);
    },
    staleTime: 60_000,
  });
}
