import { useQuery } from "@tanstack/react-query";
import { teamService, type ActivityLogParams } from "@/services/teamService";

export function useTeamMe() {
  return useQuery<unknown>({
    queryKey: ["team", "me"],
    queryFn: async () => {
      const res = await teamService.getMe();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useTeamActivityLogs(params?: ActivityLogParams) {
  return useQuery<unknown>({
    queryKey: ["team", "activity-logs", params],
    queryFn: async () => {
      const res = await teamService.getActivityLogs(params);
      return res.data;
    },
    staleTime: 30_000,
  });
}

interface PagedTeam {
  rows: unknown[];
  total: number;
  page: number;
  pages: number;
}

function num(v: unknown, d: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
}

export function useTeamList(page = 1, limit = 20, search?: string) {
  return useQuery<PagedTeam>({
    queryKey: ["team", "list", page, limit, search],
    queryFn: async () => {
      const res = await teamService.getTeam({ page, limit, search });
      const body = res && typeof res === "object" ? (res as Record<string, unknown>) : {};
      const inner = body.data && typeof body.data === "object" && !Array.isArray(body.data)
        ? (body.data as Record<string, unknown>)
        : body;
      const rows = Array.isArray(body.data)
        ? (body.data as unknown[])
        : Array.isArray(inner.data)
          ? (inner.data as unknown[])
          : [];
      const meta = body.meta && typeof body.meta === "object" ? (body.meta as Record<string, unknown>) : inner;
      return {
        rows,
        total: num(meta.total ?? meta.total_admins ?? meta.count, rows.length),
        page: num(meta.page, page),
        pages: num(meta.pages ?? meta.total_pages, 1),
      };
    },
    staleTime: 30_000,
  });
}

export function useRoles() {
  return useQuery<unknown[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await teamService.getRoles();
      const body = res && typeof res === "object" ? (res as Record<string, unknown>) : {};
      return Array.isArray(body.data) ? (body.data as unknown[]) : [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useTeamActivityLogsPaged(page = 1, limit = 20) {
  return useQuery<PagedTeam>({
    queryKey: ["team", "activity-logs", "paged", page, limit],
    queryFn: async () => {
      const res = await teamService.getActivityLogs({ page, limit });
      const body = res && typeof res === "object" ? (res as Record<string, unknown>) : {};
      const inner = body.data && typeof body.data === "object" && !Array.isArray(body.data)
        ? (body.data as Record<string, unknown>)
        : body;
      const rows = Array.isArray(body.data)
        ? (body.data as unknown[])
        : Array.isArray(inner.data)
          ? (inner.data as unknown[])
          : [];
      const meta = body.meta && typeof body.meta === "object" ? (body.meta as Record<string, unknown>) : inner;
      return {
        rows,
        total: num(meta.total ?? meta.total_logs ?? meta.count, rows.length),
        page: num(meta.page, page),
        pages: num(meta.pages ?? meta.total_pages, 1),
      };
    },
    staleTime: 30_000,
  });
}
