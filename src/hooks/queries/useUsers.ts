import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { unwrapApiData, unwrapApiList } from "@/utils/apiData";

interface UseUsersParams {
  page?: number;
  search?: string;
  status?: string;
  kyc_status?: string;
  [key: string]: unknown;
}

export function useUsers(params?: UseUsersParams) {
  return useQuery<unknown[]>({
    queryKey: ["users", params],
    queryFn: async () => {
      const res = await userService.getUsers(params as Record<string, unknown>);
      return unwrapApiList(res, ["users"]);
    },
    staleTime: 30_000,
  });
}

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const res = await userService.getUserDetail(userId!);
      return res.data;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useUserReferrals(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-referrals", userId],
    queryFn: async () => {
      const res = await userService.getUserReferrals(userId!);
      return unwrapApiData(res, null);
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

interface PagedUsers {
  rows: unknown[];
  total: number;
  page: number;
  pages: number;
}

// Paginated user list (for the Admin Users page) — exposes response meta.
export function useUsersPaged(page = 1, limit = 20, search?: string) {
  return useQuery<PagedUsers>({
    queryKey: ["users", "paged", page, limit, search],
    queryFn: async () => {
      const res = await userService.getUsers({ page, limit, search });
      const body = res && typeof res === "object" ? (res as Record<string, unknown>) : {};
      const rows = Array.isArray(body.data)
        ? (body.data as unknown[])
        : unwrapApiList(res, ["users"]);
      const meta = body.meta && typeof body.meta === "object" ? (body.meta as Record<string, unknown>) : {};
      const n = (v: unknown, d: number) => {
        const x = Number(v);
        return Number.isFinite(x) && x > 0 ? x : d;
      };
      return {
        rows,
        total: n(meta.total, rows.length),
        page: n(meta.page, page),
        pages: n(meta.pages, 1),
      };
    },
    staleTime: 30_000,
  });
}
