import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";

export function useAdmins() {
  return useQuery<unknown[]>({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await adminService.getAdmins();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useAdminActivityLogs() {
  return useQuery<unknown[]>({
    queryKey: ["admins", "activity-logs"],
    queryFn: async () => {
      const res = await adminService.getActivityLogs();
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useAdminDetail(id: string) {
  return useQuery<unknown>({
    queryKey: ["admins", id, "detail"],
    queryFn: async () => {
      const res = await adminService.getAdminDetail(id);
      return res.data;
    },
    enabled: !!id,
  });
}
