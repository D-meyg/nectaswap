import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { unwrapApiList, unwrapApiObject } from "@/utils/apiData";
import type { TeamMeData } from "@/api/types";

export function useTeamMe() {
  return useQuery<TeamMeData>({
    queryKey: ["team", "me"],
    queryFn: async () => {
      const res = await adminService.getMe();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useAdmins() {
  return useQuery<unknown[]>({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await adminService.getAdmins();
      return unwrapApiList(res, ["admins"]);
    },
    staleTime: 5 * 60_000,
  });
}

export function useAdminActivityLogs() {
  return useQuery<unknown[]>({
    queryKey: ["admins", "activity-logs"],
    queryFn: async () => {
      const res = await adminService.getActivityLogs();
      return unwrapApiList(res, ["logs", "activity_logs"]);
    },
    staleTime: 60_000,
  });
}

export function useAdminDetail(id: string) {
  return useQuery<unknown>({
    queryKey: ["admins", id, "detail"],
    queryFn: async () => {
      const res = await adminService.getAdminDetail(id);
      return unwrapApiObject(res, {});
    },
    enabled: !!id,
  });
}
