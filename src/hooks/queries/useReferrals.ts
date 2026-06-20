import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export function useReferralStats() {
  return useQuery<unknown>({
    queryKey: ["referrals", "stats"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.REFERRALS.STATS);
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useReferrers() {
  return useQuery<unknown[]>({
    queryKey: ["referrals", "referrers"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.REFERRALS.REFERRERS);
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useReferredUsers() {
  return useQuery<unknown[]>({
    queryKey: ["referrals", "referred-users"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.REFERRALS.REFERRED_USERS);
      return data.data;
    },
    staleTime: 60_000,
  });
}
