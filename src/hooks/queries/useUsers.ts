import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";

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
      return res.data;
    },
    staleTime: 30_000,
  });
}
