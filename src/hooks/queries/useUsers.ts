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
