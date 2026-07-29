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
